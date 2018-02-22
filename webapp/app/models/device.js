import db from '../utils/connection';

function Device() {
  return {
    findDevice: async function(userId, deviceId, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT ud.*, st.session_token
          FROM user_devices AS ud
          INNER JOIN session_tokens as st
          ON st.device_id = ud.device_id AND st.user_id = ud.user_id
          WHERE ud.device_id = ? AND ud.user_id = ?;
        `, [deviceId, userId], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) connection.rollback();
            throw err;
          }
          if (results.length === 0) {
            resolve(null);
          } else {
            console.log(results[0].session_token)
            resolve(results[0].session_token);
          }
        });
      });
    },

    addDevice: async function(userId, deviceId, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      console.log('+ add device', 'user:', userId, 'device:', deviceId);
      return new Promise((resolve, reject) => {
        connection.query(`
          INSERT INTO user_devices (device_id, user_id) VALUES (?, ?);
        `, [deviceId, userId], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) connection.rollback();
            throw err;
          }
          resolve(true);
        });
      });
    },

    removeDevice: async function(deviceId, conn) {
      let connection = conn;
      if (!connection) {
        connection = await db.getConnection();
      }
      return new Promise((resolve, reject) => {
        connection.query(`
          DELETE FROM user_devices WHERE device_id = ?;
        `, [deviceId], (err, results, fields) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) connection.rollback();
            throw err;
          }
          resolve(true);
        });
      });
    },
  };
}

export default Device();
