import shortid from "shortid";
import db from '../utils/connection';

class Player {
  static formatPlayer(row) {
    const fields = [
      'id', 'short_id', 'usatt_url', 'rating', 'name', 'updated_at', 'created_on', 'group_id', 'pos'
    ];
    const player = {};
    fields.forEach(field => {
      if (row[field]) {
        player[field] = row[field];
      }
    });

    return player;
  }

  static async getMostActivePlayers(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT cp.*, hc.session_count AS session_count FROM players AS p2
        INNER JOIN (
          SELECT COUNT(*) AS session_count, id FROM players AS p
          INNER JOIN player_histories AS ph
          ON p.id = ph.player_id
          INNER JOIN club_players AS cp
          ON cp.player_id = p.id
          INNER JOIN clubs AS c
          ON c.id = cp.club_id
          WHERE c.id = ?
          GROUP BY id
          ORDER BY session_count DESC
          LIMIT 10
        ) AS hc
        ON p2.id = hc.id
      `, [id], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        // format blha blah
        return resolve(results);
      });
    });
  }
  static async removePlayer(clubId, id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        DELETE FROM players WHERE id = ? AND EXISTS (
          SELECT * FROM (SELECT * FROM players) AS p
          INNER JOIN club_players AS cp
          ON cp.player_id = p.id
          INNER JOIN clubs AS c
          ON c.id = cp.club_id
          WHERE p.id = ? AND c.id = ?
        )
      `, [id, id, clubId], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          reject({ player: 'Player not found.' });
        }
      });
    });
  }

  static async updatePlayer(clubId, id, player) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE players AS p
        INNER JOIN club_players As cp
        SET p.name = ?, cp.rating = ?
        WHERE id = ? AND EXISTS (
          SELECT * FROM (SELECT * FROM players) AS p
          INNER JOIN club_players AS cp
          ON cp.player_id = p.id
          INNER JOIN clubs AS c
          ON c.id = cp.club_id
          WHERE p.id = ? AND c.id = ?
        )
      `, [player.name, player.rating, id, id, clubId], async (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.affectedRows === 0) {
          reject({ player: 'Player not found.' });
        } else {
          resolve(id);
        }
      });
    });
  }

  static async createPlayer(clubId, player, conn) {
    const shortId = shortid.generate();
    const connection = conn || await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) throw tError;
        connection.query(`
          INSERT INTO players (short_id, name)
          VALUES (?, ?, ?)
        `, [shortId, player.name], (err, results, field) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw(err);
          }
          resolve(results.insertId);
        });
      });
    }).then((id) => Player.createClubPlayer(connection, clubId, id, rating));
  }

  createClubPlayer(connection, clubId, id) {
    return new Promise((resolve, reject) => {
      connection.query(`
        INSERT INTO club_players (club_id, player_id, rating)
        VALUES (?, ?, ?)
      `, [clubId, id, rating], (err, results, field) => {
        if (err) {
          connection.rollback();
          connection.release();
          throw err;
        }
        connection.commit();
        connection.release();
        resolve(id);
      });
    });
  }

  static async createPlayers(clubId, players) {
    const connection = await db.getConnection();
    const promises = players.map(player => Player.createPlayer(clubId, player));
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) throw tError;
        Promise.all(promises)
          .then(
            (players) => {
              connection.commit();
              connection.release();
              resolve(players);
            },
            (error) => {
              connection.rollback();
              connection.release();
              reject(error);
            }
          );
      });
    });
  }

  static async findPlayers(clubId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT p.id, p.short_id, cp.rating, p.name, p.created_on, p.updated_at
        FROM players AS p
        INNER JOIN club_players AS cp
        ON cp.player_id = p.id
        WHERE cp.club_id = ?
      `, [clubId], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        const data = results.map(row => Player.formatPlayer(row));
        return resolve(data);
      });
    });
  }

  static async find(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT p.id, p.short_id, cp.rating, p.name, p.created_on, p.updated_at
        FROM players AS p
        INNER JOIN club_players AS cp
        ON cp.player_id = p.id
        WHERE p.id = ?
      `, [id], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.length === 0) {
          return reject({ player: 'Player not found' });
        }
        const player = Player.formatPlayer(results[0]);
        return resolve(player);
      });
    });
  }
}

export default Player;
