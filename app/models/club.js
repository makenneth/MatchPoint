import Raven from "raven";
import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import shortid from "shortid";
import bcrypt from "bcrypt-as-promised";
import db from '../utils/connection';
import mysql from "mysql";
import ClubValidation from "../validations/club";
  // id              MEDIUMINT    NOT NULL AUTOINCREMENT
  // password_digest VARCHAR(50)  NOT NULL
  // session_token   VARCHAR(32)  NOT NULL
  // short_id        CHAR(10)     NOT NULL
  // username        VARCHAR(40)  NOT NULL
  // club_name       VARCHAR(80)  NOT NULL
  // email           VARCHAR(255) NOT NULL
  // verified        TINYINT(1)   DEFAULT 0
  // token           VARCHAR(50)  NOT NULL
  // confirm_token   VARCHAR(50)  NOT NULL
  // updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMSTAMP
  // created_on      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP

class Club {
  static generateToken() {
    return URLSafeBase64.encode(crypto.randomBytes(32));
  }

  static isPassword(password, passwordDigest) {
    return bcrypt.compare(password, passwordDigest);
  }

  static generatePasswordDigest(password) {
    return bcrypt.hash(password, 10);
  }

  static formatClubRow(row) {
    const fields = [
      'id', 'password_digest', 'session_token',
      'short_id', 'username', 'club_name',
      'email', 'verified', 'token',
      'confirm_token', 'updated_at', 'created_on'
    ];
    const club = {};
    fields.forEach(field => {
      if (row[field]) {
        club[field] = row[field];
      }
    });

    return club;
  }

  async detail(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, short_id, username, club_name, email, verified, session_token
        FROM clubs WHERE id = ?
      `, [id], (err, results, field) => {
        connection.release();
        if (err) throw err;
        console.log(results);
        if (results.length > 0) {
          const club = Club.formatClubRow(results[0]);
          resolve(club);
        } else {
          reject({ club: 'Club not found.' });
        }
      });
    });
  }

  async find(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, short_id, username, club_name, email, verified
        FROM clubs WHERE id = ?
      `, [id], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.length > 0) {
          const club = Club.formatClubRow(results[0]);
          resolve(club);
        } else {
          reject({ club: 'Club not found.' });
        }
      });
    });
  }

  async all() {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, short_id, username, club_name, email
        FROM clubs
      `, (err, results, field) => {
        connection.release();
        if (err) throw(err);
        const clubs = results.map(r => Club.formatClubRow(r));
        resolve(clubs);
      });
    });
  }

  async confirm(token) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE clubs
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
  }

  async resetSessionTokenWithOldToken(token) {
    const connection = await db.getConnection();
    const newToken = ClubModel.generateToken();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE clubs SET session_token = ?
        WHERE session_token = ?
      `, [newToken, token], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.affectedRows > 0) {
          resolve(newToken);
        } else {
          reject({ token: 'Session token might have expired.' });
        }
      });
    });
  }


  async changeInfo(club, data) {
    const info = data.info;
    {
      const error = ClubValidation.validateInfo(info);
      if (error) throw error;
    }
    try {
      const isPassword = await ClubModel.isPassword(data.password);
    } catch (_e) {
      return Promise.reject({ password: "Password is incorrect" });
    }
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      let sql = "UPDATE clubs SET ";
      const inserts = [];
      sql = mysql.format(sql, inserts);
      if (club.email !== info.email) {
        sql += ' email = ?, confirmed = 0, confirm_token'
        //although this will work, it will still say "welcome to matchpoint";
        const confirmToken = ClubModel.generateToken();
        inserts.push(info.email, confirmToken);
      }
      sql += 'city = ?, state = ? ';
      inserts.push(info.city, info.state);
      club.location = { ...info };
      sql += 'WHERE id = ?';
      inserts.push(club.id);
      connection.query(sql, inserts, (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          reject({ club: 'Failed to update.' });
        }
      })
    });
  }

  async changePassword(id, info) {
    const { oldPassword, newPassword } = info;
    if (newPassword.length < 8) {
      throw ({ newPassword: "Password must have at least 8 characters." });
    }

    if (oldPassword === newPassword) {
      return Promise.resolve();
    }

    const connection = await db.getConnection();
    try {
      const isPassword = await club.isPassword(oldPassword);
    } catch (_e) {
      return Promise.reject({ oldPassword: "Old password is incorrect." });
    }
    const digest = await this.generatePasswordDigest(newPassword);
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE clubs
        SET password_digest = ?
        WHERE id = ?`, [digest, id], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          Raven.captureException({
            logging_reason: 'Exploits',
            error_description: 'Users attempted to call change password directly.'
          });
          reject({ user: 'User doesn\'t exist.' });
        }
      });
    });
  }

  async create(user) {
    const connection = await db.getConnection();
    const digest = await ClubModel.generatePasswordDigest(user.password);
    const isPassword = await ClubModel.isPassword(user.password, digest);
    return new Promise((resolve, reject) => {
      connection.beginTransaction((tError) => {
        if (tError) {
          connection.release();
          throw tError;
        }

        connection.query(`
         INSERT INTO clubs
         (short_id, username, email, club_name, password_digest, session_token, confirm_token)
         VALUES
         (?, ?, ?, ?, ?, ?)`,
         [
           shortid.generate(), user.username.toLowerCase(), user.email,
           user.clubName, digest, ClubModel.generateToken(), ClubModel.generateToken()
         ],
         (err, results, field) => {
            if (err) {
              connection.release();
              if (err.code === 'ER_DUP_ENTRY') {
                return reject({ username: 'Username has been taken' });
              }
              throw err;
            }
            resolve(results.insertId);
          });
      });
    }).then(clubId => this.insertGeolocations(connection, user, clubId));
  }

  insertGeolocations(connection, user, clubId) {
    return new Promise((resolve, reject) => {
      connection.query(`
        INSERT INTO club_geolocations
        (city, state, address, club_id)
        VALUES (?, ?, ?, ?)
      `, [user.city, user.state, user.address, clubId], (err, results, field) => {
        if (err) {
          connection.rollback();
          connection.release();
          throw(err);
        }
        connection.commit();
        connection.release();
        console.log('inserted geolocations');
        resolve(clubId);
      });
    });
  }

  async resetSessionToken(id) {
    const token = ClubModel.generateToken();
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
       UPDATE clubs
       SET session_token = ?
       WHERE id = ?`, [token, id], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.affectedRows > 0) {
          resolve(token);
        } else {
          reject({ token: 'Session token might have expired.' });
        }
      });
    });
  }

  async findBySessionToken(sessionToken) {
    // check if I need all the fields
    if (!sessionToken) {
      return Promise.reject({ token: 'Auth token is required.' });
    }
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, short_id, username, club_name,
          email, verified, token, confirm_token,
          updated_at, created_on
        FROM clubs
        WHERE session_token = ?
      `, [sessionToken], (err, results, field) => {
        connection.release();
        if (err) throw(err);
        if (results.length > 0) {
          const club = Club.formatClubRow(results[0]);
          return resolve(club);
        } else {
          return reject({ token: 'Session token might have expired.' });
        }
      });
    });
  }

  async resetPasswordWithToken(token, newPassword) {
    const connection = await db.getConnection();
    return ClubModel.generatePasswordDigest(newPassword)
      .then((digest) => {
        return new Promise((resolve, reject) => {
          connection.query(`
           UPDATE clubs
           SET password_digest = ?, token = ?
           WHERE token = ?
          `, [digest, "", token], (err, results, field) => {
            connection.release();
            if (err) throw(err);
            if (results.affectedRows > 0) {
              resolve(results);
            } else {
              reject({ token: 'Session token might have expired.' });
            }
          });
        });
      });
  }

  async findByUsernameAndPassword(username, password) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
       SELECT * FROM clubs WHERE username = ?
      `, [username], async (err, results, field) => {
        connection.release();
        if (err) throw(err);

        if (results.length === 0) {
          return reject({
            username: 'Username or password is not correct.',
            password: 'Username or password is not correct.'
          });
        }
        const digest = results[0].password_digest;
        try {
          const isPassword = await ClubModel.isPassword(password, digest);
        } catch (e) {
          return reject({
            username: 'Username or password is not correct.',
            password: 'Username or password is not correct.'
          });
        }
        const club = Club.formatClubRow(results[0]);
        delete club.password_digest;
        return resolve(club);
      });
    });
  }
}

const model = new Club();
export default model;
