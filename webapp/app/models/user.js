import shortid from "shortid";
import db from '../utils/connection';

class User {
  static format(row) {
    const fields = [
      'id', 'short_id', 'usatt_url',
      'rating', 'name', 'updated_at',
      'created_on', 'group_id', 'pos',
      'session_count', 'promoted',
    ];
    const user = {};
    fields.forEach(field => {
      if (row[field]) {
        player[field] = row[field];
      }
    });

    return player;
  }

  static async create() {
    const connection = await db.getConnection();
    // return new Promise((resolve, reject) => {
    //   connection.query(`
    //     SELECT u.* FROM users AS u
    //     INNER JOIN user_tokens AS ut
    //     WHERE device_id = ? AND token = ?
    //   `, [deviceId, token], (err, results, fields) => {
    //     connection.release();
    //     if (err) throw err;
    //     resolve(User.format(r));
    //   });
    // });
  }

  static async update() {
    const connection = await db.getConnection();
  }

  static async find(token, deviceId) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT u.* FROM users AS u
        INNER JOIN user_tokens AS ut
        WHERE device_id = ? AND token = ?
      `, [deviceId, token], (err, results, fields) => {
        connection.release();
        if (err) throw err;
        resolve(User.format(r));
      });
    });
  }
}

export default User;
