import shortid from "shortid";
import Token from '../helpers/token';
import db from '../utils/connection';
import bcrypt from "../helpers/bcrypt";
import Session from "./session";
import Club from "./club";
import Device from './device';
import { camelCase } from 'lodash';

function format(row, secure = true) {
  const secured = [
    'password_digest', 'session_token', 'token', 'device_id', 'confirm_token',
  ];
  const fields = [
    'id', 'short_id', 'usatt_url', 'username',
    'club_name', 'email', 'account_id',
    /* 'updated_at', 'created_on', */
    'name', 'rating',
    'group_id', 'pos', 'verified', 'account_type'
  ];
  const user = {};
  fields.forEach(field => {
    if (row[field]) {
      user[camelCase(field)] = row[field];
    }
  });

  if (!secure) {
    secured.forEach(field => {
      if (row[field]) {
        user[camelCase(field)] = row[field];
      }
    });
  }

  return user;
}
const User = {
  create: async function(type, info, deviceId) {
    console.log('+ create user', deviceId);
    const connection = await db.getConnection();
    const digest = await bcrypt.generatePasswordDigest(info.password);
    const userId = await new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) {
          connection.release();
          throw tError;
        }

        connection.query(`
          INSERT INTO users (
            account_type, email, username,
            short_id, password_digest, confirm_token
          ) VALUES (?, ?, ?, ?, ?, ?);
        `, [
          type, info.email, info.username,
          shortid(), digest, Token.generateToken()
        ], (err, results, fields) => {
          connection.release();
          if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              if (err.sqlMessage.match(/email/)) {
                return reject({ email: 'Email has been taken' });
              } else if (err.sqlMessage.match(/username/)) {
                return reject({ username: 'Username has been taken' });
              } else if (err.sqlMessage.match(/club_name/)) {
                return reject({ clubName: 'Club name has been taken' });
              }
            } else {
              throw err;
            }
          }
          return resolve(results.insertId);
        });
      });
    });
    console.log(userId, 'created')
    if (type === 'club') {
      const clubId = await Club.createInitial(userId, connection);
    }
    // if deviceId not present - cookie disabled then we should not add the device
    if (deviceId) {
      const _ = await Device.addDevice(userId, deviceId, connection)
      const token = await Session.insertToken(userId, deviceId, connection);
    }
    connection.commit();
    connection.release();
    return Promise.resolve(userId);
  },

  update: async function() {
    const connection = await db.getConnection();
  },

  findBySessionToken: async function(token, deviceId, secure = true) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT u.*, COALESCE(c.id, p.id) AS account_id, COALESCE(c.club_name, NULL) AS club_name
        FROM users AS u
        LEFT JOIN clubs AS c
        ON u.account_type = 'club' AND u.id = c.user_id
        LEFT JOIN (
          SELECT p.id AS id, up.user_id AS user_id
          FROM players AS p
          INNER JOIN user_players AS up
          ON p.id = up.player_id
        ) AS p
        ON u.account_type = 'player' AND u.id = p.user_id
        INNER JOIN user_devices AS ud
        ON ud.user_id = u.id
        INNER JOIN session_tokens AS st
        ON st.device_id = ud.device_id AND st.user_id = ud.user_id
        WHERE ud.device_id = ? AND st.session_token = ?
      `, [deviceId, token], (err, results, fields) => {
        connection.release();
        if (err) throw err;
        if (results.length === 0) {
          return reject({ user: 'User not found.' });
        }
        return resolve(format(results[0], secure));
      });
    });
  },

  findByResetToken: async function(token) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, username, email
        FROM users
        WHERE token = ?
      `, [token], (err, results, fields) => {
        connection.release();
        if (err) {
          console.log(err);
          throw err;
        }
        if (results.length === 0) {
          throw "Internal Server Error";
        }
        return resolve(format(results[0], true));
      });
    });
  },

  findById: async function(id, deviceId, secure = true) {
    const connection = await db.getConnection();
    // what about private sessions?
    console.log('+ findUserById', id, deviceId, secure);
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT u.*, COALESCE(c.id, p.id) AS account_id
        FROM users AS u
        LEFT JOIN clubs AS c
        ON u.account_type = 'club' AND u.id = c.user_id
        LEFT JOIN (
          SELECT p.id AS id, up.user_id AS user_id
          FROM players AS p
          INNER JOIN user_players AS up
          ON p.id = up.player_id
        ) AS p
        ON u.account_type = 'player' AND u.id = p.user_id
        INNER JOIN user_devices AS ud
        ON ud.user_id = u.id
        INNER JOIN session_tokens AS st
        ON st.device_id = ud.device_id
        WHERE u.id = ? AND ud.device_id = ?;
      `, [id, deviceId], (err, results, fields) => {
        connection.release();
        if (err) throw err;
        if (results.length === 0) {
          return reject({ user: 'User not found.' });
        }
        return resolve(format(results[0], secure));
      });
    });
  },

  findByUsernameAndPassword: async function(username, password) {
    const connection = await db.getConnection();
    const user = await new Promise((resolve, reject) => {
      connection.query(`
        SELECT u.*, COALESCE(c.id, p.id) AS account_id, COALESCE(c.club_name, NULL) AS club_name
        FROM users AS u
        LEFT JOIN clubs AS c
        ON u.account_type = 'club' AND u.id = c.user_id
        LEFT JOIN (
          SELECT p.id AS id, up.user_id AS user_id
          FROM players AS p
          INNER JOIN user_players AS up
          ON p.id = up.player_id
        ) AS p
        ON u.account_type = 'player' AND u.id = p.user_id
        WHERE u.username = ?
      `, [username], (err, results, fields) => {
        connection.release();
        if (err) throw err;
        if (results.length === 0) {
          reject({
            username: 'Username or password is incorrect.',
            password: 'Username or password is incorrect.',
          });
        } else {
          resolve(format(results[0], false));
        }
      });
    });
    try {
      const isPassword = await bcrypt.isPassword(password, user.passwordDigest);
      if (!isPassword) {
        return Promise.reject({
          username: 'Username or password is incorrect.',
          password: 'Username or password is incorrect.',
        });
      }
    } catch (e) {
      return Promise.reject({
        username: 'Username or password is incorrect.',
        password: 'Username or password is incorrect.',
      });
    }
    console.log(user);
    return Promise.resolve(user);
  },

  changeEmail: async function(userId, email, conn) {
    const emailRegex = new RegExp('.+@.+..+', 'i');
    if (email.length === 0 || !emailRegex.test(email)) {
      return Promsie.reject({ email: 'Email is not the right format.' });
    }
    let connection = conn;
    if (!conn) {
      connection = await db.getConnection();
    }

    const newToken = Token.generateToken();
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE users
        SET email = ?, verified = 0, confirm_token = ?
        WHERE id = ?`, [email, newToken, userId], (err, results, field) => {
        if (err) {
          if (conn) connection.rollback();
          connection.release();
          if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.match(/email/)) {
              return reject({ email: 'Email has been taken' });
            }
          }
          throw err;
        }
        if (conn) connection.commit();
        connection.release();
        if (results.affectedRows > 0) {
          resolve(newToken);
        } else {
          reject({ email: 'Failed to update email.' });
        }
      });
    });
  },

  changePassword: async function(userId, newPassword) {
    const connection = await db.getConnection();
    const digest = await bcrypt.generatePasswordDigest(newPassword);
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE users
        SET password_digest = ?
        WHERE id = ?`, [digest, userId], (err, results, field) => {
        if (err) throw(err);
        if (results.affectedRows > 0) {
          resolve(connection);
        } else {
          // Raven.captureException({
          //   logging_reason: 'Exploits',
          //   error_description: 'Users attempted to call change password directly.'
          // });
          reject({ user: 'User doesn\'t exist.' });
        }
      });
    });
  },

  changeInfo: async function(user, data, conn) {
    const { password, info } = data;
    {
      const error = ClubValidation.validateInfo(info);
      if (error) throw error;
    }
    try {
      const isPassword = await bcrypt.isPassword(password, user.passwordDigest);
    } catch (_e) {
      return Promise.reject({ password: "Password is incorrect" });
    }
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      if (club.address !== info.address) {
        connection.query(`
          UPDATE club_geolocations
          SET address = ?, city = ?, state = ?, country = ?, geolat = ?, geolng = ?
          WHERE club_id = ?`,
          [info.address, info.city, info.state, info.country, info.geolat, info.gelng, club.id],
          (err, results, field) => {
            if (err) {
              connection.rollback();
              connection.release();
              throw err;
            }
            connection.commit();
            connection.release();
            if (results.affectedRows > 0) {
              resolve(true);
            } else {
              reject({ info: 'Failed to update info.' });
            }
          });
      } else {
        connection.commit();
        connection.release();
        resolve(true);
      }
    });
  },


  confirm: async function(token) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE users
        SET verified = 1, confirm_token = ""
        WHERE confirm_token = ?
      `, [token], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          reject({ token: 'Token might have expired.' });
        }
      });
    });
  },

  resetPassword: async function(value) {
    const connection = await db.getConnection();
    const resetToken = Token.generateToken();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE users
        SET token = ?
        WHERE email = ? OR username = ?;
      `, [resetToken, value, value], (err, results, field) => {
        connection.release();
        if (err) throw err;
        console.log(results);
        if (results.affectedRows > 0) {
          resolve(resetToken);
        } else {
          reject({ user: 'User not found.' });
        }
      });
    });
  },

  resetPasswordWithToken: async function(token, password) {
    const connection = await db.getConnection();
    const digest = await bcrypt.generatePasswordDigest(password);
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE users
        SET password_digest = ?, token = NULL
        WHERE token = ?;
      `, [digest, token], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          reject({ token: 'Token is invalid.' });
        }
      });
    });
  },

  clearAllSessionTokens: async function(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        DELETE FROM session_tokens
        WHERE device_id in (
          SELECT device_id
          FROM user_devices
          WHERE user_id = ?
        );
      `, [id], (err, results, field) => {
        connection.release();
        if (err) {
          console.log(err);
          throw err;
        }
        resolve(true);
      });
    });
  },
};

export default User;
