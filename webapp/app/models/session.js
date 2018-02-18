import Token from '../helpers/token';
import db from '../utils/connection';

function User() {
  return {
    resetToken: async function(oldToken, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      const token = Token.generateToken();
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE session_tokens
          SET session_token = ?
          WHERE session_token = ?;
        `, [token, oldToken], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) {
              connection.rollback();
              connection.release();
            }
            throw err;
          }
          resolve();
        });
      });
    },

    insertToken: async function(deviceId, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      const sessionToken = Token.generateToken();
      console.log('+ insertToken', sessionToken);
      return new Promise((resolve, reject) => {
        connection.query(`
          INSERT INTO session_tokens
          (device_id, session_token)
          VALUES (?, ?);
        `, [deviceId, sessionToken], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) {
              connection.rollback();
              connection.release();
            }
            throw err;
          }
          resolve(sessionToken);
        });
      });
    },

    removeToken: async function(session_token, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      return new Promise((resolve, reject) => {
        connection.query(`
          DELETE FROM session_tokens
          WHERE session_token = ?;
        `, [sessionToken], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) {
              connection.rollback();
              connection.release();
            }
            throw err;
          }
          resolve(true);
        });
      });
    },
  };
}

export default User();
