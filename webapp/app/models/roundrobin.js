import Raven from 'raven';
import shortid from "shortid";
import ScoreCalculation from '../helpers/scoreCalculation';
import db from '../utils/connection';
import Player from '../models/player';
import moment from 'moment';

class RoundRobin {
  static format(row) {
    const fields = [
      'id', 'short_id',
      'club_id', 'date',
      'num_players', /* don't think we need this */
      'results', 'finalized',
      'selected_schema', 'created_on'
    ];
    const roundrobin = {};
    fields.forEach(field => {
      if (field === 'results' || field === 'selected_schema') {
        try {
          roundrobin[field] = JSON.parse(row[field]);
        } catch (e) {
          // console.log(e);
          if (field === 'selected_schema') {
            roundrobin[field] = [];
          } else if (field === 'results') {
            roundrobin[field] = {};
          }
        }
      } else if (row.hasOwnProperty(field)) {
        if (field === 'date') {
          roundrobin[field] = moment(row[field]).format('YYYY-MM-DD');
        } else {
          roundrobin[field] = row[field];
        }
      }
    });

    return roundrobin;
  }

  static async findAllByClub(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT
        r.id, r.club_id, r.date, r.short_id, r.finalized, r.num_players, r.created_on
        FROM roundrobins AS r
        INNER JOIN clubs AS c
        ON c.id = r.club_id
        WHERE c.id = ?
        ORDER BY r.date DESC
      `, [clubId], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        const data = results.map(r => RoundRobin.format(r));
        resolve(data);
      });
    });
  }

  static async findByClub(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT r.* FROM roundrobins AS r
        INNER JOIN clubs AS c
        ON c.id = r.club_id
        WHERE c.id = ? AND r.id = ?
      `, [clubId, id], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        const data = RoundRobin.format(results[0]);
        resolve(data);
      });
    });
  }

  static async findByClubAndShortId(clubId, id, conn) {
    const connection = conn || await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT r.* FROM roundrobins AS r
        INNER JOIN clubs AS c
        ON c.id = r.club_id
        WHERE c.id = ? AND r.short_id = ?
      `, [clubId, id], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        if (results.length === 0) {
          reject({ roundrobin: 'Roundrobin not found.' });
        } else {
          const data = RoundRobin.format(results[0]);
          resolve(data);
        }
      });
    });
  }

  static async findDetail(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT
        p.*, COALESCE(ph1.rating, ph2.rating) AS rating, rp.group_id, rp.pos
        FROM players AS p
        INNER JOIN roundrobin_players AS rp
        ON p.id = rp.player_id
        INNER JOIN roundrobins AS r
        ON r.id = rp.roundrobin_id
        LEFT JOIN (
          SELECT phs1.id, phs1.rating, phs1.player_id
          FROM (
            SELECT ph1.id, rating, ph1.club_id, ph1.player_id, ph1.change_date
            FROM player_histories AS ph1
            INNER JOIN (
              SELECT MAX(id) AS id, club_id, player_id, change_date
              FROM player_histories
              WHERE club_id = ?
              GROUP BY player_id, club_id, change_date
            ) AS ph2
            ON ph1.id = ph2.id AND ph1.player_id = ph2.player_id
            WHERE ph1.club_id = ?
          ) AS phs1
          INNER JOIN (
            SELECT club_id, player_id, MAX(change_date) AS max_date
            FROM player_histories
            WHERE club_id = ?
            GROUP BY player_id, club_id
          ) AS phs2
          ON phs1.player_id = phs2.player_id AND
             phs1.change_date = phs2.max_date AND
             phs1.club_id = phs2.club_id
        ) AS ph1
        ON p.id = ph1.player_id AND r.finalized = 0
        LEFT JOIN (
          SELECT old_rating AS rating, player_id
          FROM player_histories AS ph
          INNER JOIN roundrobins AS r
          ON r.id = ph.roundrobin_id
          WHERE r.short_id = ?
        ) AS ph2
        ON p.id = ph2.player_id AND r.finalized = 1
        WHERE r.club_id = ? AND r.short_id = ?
        ORDER BY rp.group_id ASC, rp.pos ASC
      `, [clubId, clubId, clubId, id, clubId, id], async (err, results, fields) => {
        if (err) throw err;
        const players = results.map(row => Player.formatPlayer(row));
        try {
          const roundrobin = await RoundRobin.findByClubAndShortId(clubId, id, connection);
          roundrobin.players = players;
          resolve(roundrobin);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  static async findPastSessions(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT date, num_players
        WHERE club_id = ?
        ORDER BY date DESC LIMIT 5
      `, [id], (err, results, fields) => {
        connection.release();
        if (err) throw err;
        const sessions = results.map(row => RoundRobin.format(row));
        resolve(sessions);
      });
    });
  }

  static async update(clubId, id, realId, players, date, selectedSchema) {
    const connection = await db.getConnection();

    let schema;
    try {
      schema = JSON.stringify(selectedSchema);
    } catch (e) {
      return Promise.reject(e);
    }
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) {
          connection.release();
          throw tError;
        }
        connection.query(`
          UPDATE roundrobins
          SET date = ?, num_players = ?, selected_schema = ?
          WHERE short_id = ? AND finalized = 0
        `, [date, players.length, schema, id],
        (err, results, fields) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw err;
          }
          console.log(results);
          if (results.affectedRows > 0) {
            resolve(id);
          } else {
            reject({ roundrobin: 'Not found or not allowed to edit.' });
          }
        });
      });
    })
      .then(async (id) => {
        try {
          const del = await RoundRobin.deleteAllRoundrobinPlayers(connection, realId);
        } catch (e) {
          console.log(e);
          return Promise.reject(e);
        }
        try {
          const create = await RoundRobin.createRoundrobinPlayers(connection, realId, players, selectedSchema);
        } catch (e) {
          console.log(e);
          return Promise.reject(e);
        }
        return Promise.resolve(id);
      });
  }

  static deleteAllRoundrobinPlayers(connection, id) {
    return new Promise((resolve, reject) => {
      connection.query(`
        DELETE FROM roundrobin_players
        WHERE roundrobin_id = ?
      `, [id], (err, results, fields) => {
        if (err) {
          connection.rollback();
          connection.release();
          throw err;
        }

        resolve(true);
      });
    });
  }

  static async create(clubId, players, date, selectedSchema) {
    const connection = await db.getConnection();

    let schema;
    try {
      schema = JSON.stringify(selectedSchema);
    } catch (e) {
      return Promise.reject(e);
    }
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) {
          connection.release();
          throw tError;
        }
        connection.query(`INSERT INTO roundrobins
          (short_id, club_id, date, num_players, selected_schema)
          VALUES (?, ?, ?, ?, ?)
        `, [shortid.generate(), clubId, date, players.length, schema],
        (err, results, fields) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw err;
          }
          console.log(results.insertId);
          resolve(results.insertId);
        });
      });
    }).then((id) => RoundRobin.createRoundrobinPlayers(connection, id, players, selectedSchema));
  }

  static createRoundrobinPlayers(connection, id, players, schema) {
    let count = 0;
    const promises = [];
    schema.forEach((playerPerGroup, i) => {
      players.slice(count, count + playerPerGroup).forEach((player, j) => {
        promises.push(RoundRobin.createRoundrobinPlayer(connection, id, player.id, i, j));
      });
      count += playerPerGroup;
    });

    return Promise.all(promises).then(
      () => {
        connection.commit();
        connection.release();
        return id;
      },
      (err) => {
        console.log(err);
        connection.rollback();
        connection.release();
        reject(err);
      }
    )
  }

  static createRoundrobinPlayer(connection, id, playerId, group, pos) {
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO roundrobin_players
        (player_id, roundrobin_id, group_id, pos)
        VALUES (?, ?, ?, ?)
      `, [playerId, id, group, pos],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log('done', playerId);
        resolve(playerId);
      });
    });
  }

  static async remove(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`DELETE r1.* FROM roundrobins AS r1
        INNER JOIN (
          SELECT id, max(date) AS max_date
          FROM roundrobins
          WHERE finalized = 1
          GROUP BY id
        ) AS md
        ON r1.id = md.id
        WHERE r1.id = ? AND EXISTS (
          SELECT * FROM (SELECT * FROM roundrobins) AS r
          INNER JOIN clubs
          ON clubs.id = r.club_id
          WHERE r.id = ? AND clubs.id = ?
        ) AND (r1.finalized = 0 OR r1.date = md.max_date)
      `, [id, id, clubId], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        if (results.affectedRows === 0) {
          reject({ roundrobin: 'Roundrobin session doesn\'t exist' });
        } else {
          resolve(id);
        }
      });
    });
  }

  static async postResult(clubId, roundrobin, result) {
    const connection = await db.getConnection();
    let resultJSON;
    try {
      resultJSON = JSON.stringify(result);
    } catch (e) {
      return Promise.reject({ result: 'Failed to stringify result.' });
    }
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) {
          connection.release();
          throw tError;
        }
        connection.query(`
          UPDATE roundrobins AS r1
          LEFT OUTER JOIN (
            SELECT id, max(date) AS max_date
            FROM roundrobins
            WHERE finalized = 1
            GROUP BY id
          ) AS md
          ON r1.id = md.id
          SET r1.finalized = 1, r1.results = ?
          WHERE r1.id = ? AND EXISTS (
            SELECT * FROM (SELECT * FROM roundrobins) AS r
            INNER JOIN clubs
            ON clubs.id = r.club_id
            WHERE r.id = ? AND clubs.id = ?
          ) AND (r1.finalized = 0 OR r1.date = md.max_date)
        `, [resultJSON, roundrobin.id, roundrobin.id, clubId], (err, results, fields) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw err;
          }

          if (results.affectedRows === 0) {
            reject({ roundrobin: 'Not able to find the roundrobin or not allowed to edit.' });
          } else {
            resolve(true);
          }
        });
      });
    }).then(() => RoundRobin.updatePlayers(connection, clubId, roundrobin, result));
  }

  static updatePlayers(connection, clubId, roundrobin, results) {
    const calculation = new ScoreCalculation(roundrobin.players, roundrobin.selected_schema, results);
    const [sortedPlayers, winners] = calculation.sortPlayers();
    const [scoreChange, ratingChange] = calculation.calculateScoreChange();

    const promises = sortedPlayers.map((player) => {
      const rc = ratingChange[player.id.toString()];
      const change = rc + (rc > 24 ? rc - 24 : 0);
      return RoundRobin.updatePlayer(
        connection, clubId,
        roundrobin.id, player.id,
        player.rating, change,
        results[player.id], !!winners[player.id],
      );
    });
    return Promise.all(promises).then(
      (results) => {
        connection.commit();
        connection.release();
        return Promise.resolve(true);
      },
      (err) => {
        connection.rollback();
        connection.release();
        throw err;
      }
    );
  }

  static async updatePlayer(
    connection, clubId, id, playerId, oldRating, change, result, isWinner
  ) {
    const resultJSON = JSON.stringify(result);
    const date = new Date();
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO
        player_histories
        (player_id, old_rating, rating_change, rating, club_id, roundrobin_id, result, change_date, won)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating_change = ?, rating = ?, result = ?, won = ?
      `, [
        playerId, oldRating, change, oldRating + change,
        clubId, id, resultJSON, date, isWinner,
        change, oldRating + change, resultJSON, isWinner
      ],
      (err, results, field) => {
        if (err) throw err;

        if (results.affectedRows === 0) {
          console.log('player', playerId, 'was not updated');
        }
        resolve(true);
      });
    });
  }

  static async findLatestDate(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT club_id, max(Date) AS date
        FROM roundrobins
        WHERE club_id = ?
        GROUP BY club_id
      `, [clubId], (err, results, field) => {
        if (err) throw err;

        if (results.length === 0) {
          reject({ roundrobin: 'No roundrobin found for the club.' });
        } else {
          resolve(results[0].date);
        }
      })
    });
  }

  static async delete(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`DELETE r.* FROM roundrobins AS r
        LEFT OUTER JOIN (
          SELECT id, max(date) AS max_date
          FROM roundrobins
          WHERE finalized = 1
          GROUP BY id
        ) AS md
        ON md.id = r.id
        WHERE r.short_id = ? AND r.club_id = ? AND (
          r.finalized = 0 OR md.max_date = r.date
        )
      `, [id, clubId], (err, results, field) => {
        connection.release();
        if (err) throw err;

        if (results.affectedRows === 0) {
          reject({ roundrobin: 'Round robin not found or cannot be deleted.' });
        } else {
          resolve(true);
        }
      });
    });
  }

  static async findEditStatus(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT COUNT(*) > 0 AS bool
        FROM roundrobins AS r
        LEFT OUTER JOIN (
          SELECT club_id, max(date) AS max_date
          FROM roundrobins
          WHERE finalized = 1
          GROUP BY club_id
        ) AS md
        ON md.club_id = r.club_id
        WHERE r.short_id = ? AND r.club_id = ? AND (
          r.finalized = 0 OR md.max_date = r.date
        )
      `, [id, clubId], (err, results, field) => {
        connection.release();
        if (err) throw err;

        if (results.length === 0) {
          reject({ roundrobin: 'Roundrobin not found or cannot be deleted.' });
        } else {
          resolve(!!results[0].bool);
        }
      });
    });
  }

  static async findAllBriefByClub(clubIds) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, club_id, date, short_id, finalized, num_players
        FROM roundrobins
        WHERE club_id IN (?)
        ORDER BY club_id
      `, [clubIds], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        resolve(results.map(result => RoundRobin.format(result)));
      });
    });
  }
}

export default RoundRobin;
