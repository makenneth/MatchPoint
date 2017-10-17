import Raven from 'raven';
import shortid from "shortid";
import ScoreCalculation from '../helpers/scoreCalculation';
import db from '../utils/connection';
import Player from '../models/player';

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
          Raven.captureException(e);
        }
      } else if (row[field]) {
        roundrobin[field] = row[field];
      }
    });

    return roundrobin;
  }

  static async findAllByClub(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT r.* FROM roundrobins AS r
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

        const data = RoundRobin.format(results[0]);
        resolve(data);
      });
    });
  }

  static async findDetail(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT p.*, cp.rating, rp.group_id, rp.pos
        FROM players AS p
        INNER JOIN club_players AS cp
        ON cp.player_id = p.id
        INNER JOIN roundrobin_players AS rp
        ON p.id = rp.player_id
        INNER JOIN roundrobins AS r
        ON r.id = rp.roundrobin_id
        WHERE r.club_id = ? AND r.short_id = ?
        ORDER BY rp.group_id ASC, rp.pos ASC
      `, [clubId, id], async (err, results, fields) => {
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
        promises.push(Round.createRoundrobinPlayer(connection, id, player.id, i, j));
      });
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

  static async postResult(clubId, id, roundrobin, result) {
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
          INNER JOIN (
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
        `, [resultJSON, id, id, clubId], (err, results, fields) => {
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
    }).then(() => Roundrobin.updatePlayers(connection, clubId, id, roundrobin, result));
  }

  static updatePlayers(connection, clubId, id, roundrobin, results) {
    const calculation = new ScoreCalculation(roundrobin.players, roundrobin.schema, results);
    const sortedPlayers = calculation.sortPlayers();
    const [scoreChange, ratingChange] = calculation.calculateScoreChange();

    const promises = sortedPlayers.map((player) => {
      const change = ratingChange[player.id];
      const rating = player.rating + change;
      return RoundRobin.updatePlayer(connection, clubId, id, player.id, change, rating, results[player.id]);
    });

    return Promise.all(promises).then(
      () => {
        connection.commit();
        connection.release();
        throw err;
      },
      (err) => {
        connection.rollback();
        connection.release();
        throw err;
      }
    );
  }

  static async updatePlayer(connection, clubId, id, playerId, change, newRating, result) {
    const updateClubPlayer = await new Promise((resolve, reject) => {
      connection.query(`UPDATE club_players
        SET rating = ?
        WHERE player_id = ? AND club_id = ?
      `, [rating, playerId, clubId], (err, results, field) => {
        if (err) throw err;

        if (results.affectedRows === 0) {
          console.log('player', playerId, 'was not updated');
        }
        resolve(true);
      })
    });
    const resultJSON = JSON.stringify(result);
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO
        player_histories
        (player_id, rating_change, new_rating, club_id, roundrobin_id, result)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating_change = ?, new_rating = ?, result = ?
      `, [playerId, change, newRating, clubId, id, resultJSON], (err, results, field) => {
        if (err) throw err;

        if (results.affectedRows === 0) {
          console.log('player', playerId, 'was not updated');
        }
        resolve(true);
      });
    });

  }
// roundRobinSchema.statics.updateResult = function(id, result, ratingChangeDetail) {
//   return this.update(
//     { _id: id },
//     { $set: { results: result, ratingChangeDetail } }
//   );
// };

}

export default RoundRobin;
