import Raven from 'raven';
import shortid from "shortid";
import db from '../utils/connection';
import Player from '../models/player';

class Roundrobin {
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
      if (field === 'results' || field === 'selectedSchema') {
        try {
          roundrobins[field] = JSON.parse(row[field]);
        } catch (e) {
          Raven.captureException(e);
        }
      } else if (row[field]) {
        roundrobins[field] = row[field];
      }
    });

    return roundrobin;
  }

  async findAllByClub(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT r.* FROM roundrobins AS r
        INNER JOIN clubs AS c
        ON c.id = r.club_id
        WHERE c.id = ?
        ORDER BY r.created_on DESC
      `, [clubId], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        const data = results.map(r => Roundrobin.format(r));
        resolve(data);
      });
    });
  }

  async findByClub(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT r.* FROM roundrobins AS r
        INNER JOIN clubs AS c
        ON c.id = r.club_id
        WHERE c.id = ? AND r.id = ?
      `, [clubId, id], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        const data = Roundrobin.format(results[0]);
        resolve(data);
      });
    });
  }

  async findPlayers(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`SELECT p.*, rp.group_id, rp.pos
        FROM players AS p
        INNER JOIN roundrobin_players AS rp
        ON p.id = rp.player_id
        INNER JOIN roundrobin AS r
        ON r.id = rp.roundrobin_id
        WHERE c.id = ?
        ORDER BY rp.group_id ASC, rp.pos ASC
      `, [clubId], (err, results, fields) => {
        connection.release();
        if (err) throw err;

        const data = results.map(row => Player.format(row));
        resolve(data);
      });
    });
  }

  async create(clubId, players, date, selectedSchema) {
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
          (short_id, club_id, date, selected_schema)
          VALUES (?, ?, ?, ?)
        `, [shortId.generate(), clubId, date, schema],
        (err, results, fields) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw err;
          }

          resolve(results.insertId);
        });
      });
    }).then((id) => this.createRoundrobinPlayers(connection, id, players, schema));
  }

  createRoundrobinPlayers(connection, id, players, schema) {
    let count = 0;
    const promises = [];
    schema.forEach((playerPerGroup, i) => {
      players.slice(count, count + playerPerGroup).forEach((player, j) => {
        promises.push(this.createRoundrobinPlayer(connection, id, player.id, i, j));
      });
    });

    return Promise.all(promises).then(
      () => {
        connection.commit();
        connection.release();
        return id;
      },
      (err) => {
        connection.rollback();
        connection.release();
        reject(err);
      }
    )
  }

  createRoundrobinPlayer(connection, id, playerId, group, pos) {
    return new Promise((resolve, reject) => {
      connection.query(`INSERT INTO roundrobin_players
        (player_id, roundrobin_id, group_id, pos)
        VALUES (?, ?, ?, ?)
      `, [playerId, id, group, pos],
      (err, results, fields) => {
        if (err) {
          throw err;
        }

        resolve(playerId);
      });
    });
  }
// roundRobinSchema.statics.saveResult = function(id, ratingChangeDetail) {
//   return this.findOneAndUpdate(
//     { _id: id },
//     { $set: { finalized: true, ratingChangeDetail } },
//     { new: true });
// };

  async remove(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`DELETE r1.* FROM roundrobins AS r1
        INNER JOIN (
          SELECT id, max(date) AS max_date
          FROM roundrobins
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

// roundRobinSchema.statics.updateResult = function(id, result, ratingChangeDetail) {
//   return this.update(
//     { _id: id },
//     { $set: { results: result, ratingChangeDetail } }
//   );
// };

}

export default Roundrobin;
