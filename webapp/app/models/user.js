import shortid from "shortid";
import Token from '../helpers/token';
import db from '../utils/connection';
import bcrypt from "../helpers/bcrypt";
import Session from "./session";
import Device from './device';
import Club from './club';
import { camelCase } from 'lodash';

function User() {
  function format(row, secure = true) {
    const secured = [
      'password_digest', 'session_token', 'device_id',
    ];
    const fields = [
      'id', 'short_id', 'usatt_url',
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

  return {
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
        const token = await Session.insertToken(deviceId, connection);
      }
      connection.commit();
      connection.release();
      return Promise.resolve(userId);
    },

    update: async function() {
      const connection = await db.getConnection();
    },

    findBySessionToken: async function(token, deviceId) {
      const connection = await db.getConnection();
      console.log(token, deviceId);
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
          ON st.device_id = ud.device_id
          WHERE ud.device_id = ? AND st.session_token = ?
        `, [deviceId, token], (err, results, fields) => {
          connection.release();
          if (err) throw err;
          if (results.length === 0) {
            return reject({ user: 'User not found.' });
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
          console.log(secure);
          return resolve(format(results[0], secure));
        });
      });
    },

    findByUsernameAndPassword: async function(username, password) {
      const connection = await db.getConnection();
      const user = await new Promise((resolve, reject) => {
        connection.query(`
          SELECT * FROM users
          WHERE username = ?;
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

    changeEmail: async function(club, data) {
      const { password, info } = data;
      {
        const error = ClubValidation.validateInfo(info);
        if (error) throw error;
      }
      try {
        const isPassword = await bcrypt.isPassword(password, club.password_digest);
      } catch (_e) {
        return Promise.reject({ password: "Password is incorrect" });
      }
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        if (info.email && club.email !== info.email) {
          connection.query(`UPDATE users
            SET email = ?, verified = 0, confirm_token = ?
            WHERE id = ?`, [info.email, Club.generateToken(), club.id], (err, results, field) => {
            if (err) {
              connection.rollback();
              connection.release();
              if (err.code === 'ER_DUP_ENTRY') {
                if (err.sqlMessage.match(/email/)) {
                  return reject({ email: 'Email has been taken' });
                }
              }
              throw err;
            }
            if (results.affectedRows > 0) {
              resolve(true);
            } else {
              reject({ email: 'Failed to update email.' });
            }
          });
        }
      });
    },

    changePassword: async function(user, data) {
      const { oldPassword, newPassword } = data;
      if (newPassword.length < 8) {
        return Promise.reject({ newPassword: "Password must have at least 8 characters." });
      }

      if (oldPassword === newPassword) {
        return Promise.resolve();
      }

      const connection = await db.getConnection();
      try {
        console.log(user);
        let isPassword = await bcrypt.isPassword(oldPassword, user.password_digest);
      } catch (e) {
        console.log(e);
        isPassword = false;
      }
      if (!isPassword) {
        return Promise.reject({ oldPassword: "Old password is incorrect." });
      }
      const digest = await bcrypt.generatePasswordDigest(newPassword);
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE clubs
          SET password_digest = ?
          WHERE id = ?`, [digest, club.id], (err, results, field) => {
          connection.release();
          if (err) throw(err);
          if (results.affectedRows > 0) {
            resolve(true);
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
  };
}

export default User();
