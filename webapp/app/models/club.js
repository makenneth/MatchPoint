import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import bcrypt from "../helpers/bcrypt";
import shortid from "shortid";
import mysql from "mysql";
import { camelCase } from 'lodash';
import db from '../utils/connection';
import RoundRobin from './roundrobin';
import ClubValidation from "../validations/club";
  // id              MEDIUMINT    NOT NULL AUTOINCREMENT
  // password_digest VARCHAR(50)  NOT NULL
  // session_token   VARCHAR(32)  NOT NULL
  // short_id        CHAR(10)     NOT NULL
  // username        VARCHAR(40)  NOT NULL
  // club_name       VARCHAR(80)  NOT NULL
  // phone           VARCHAR(40)
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

  static formatClubRow(row) {
    const fields = [
      'id', 'short_id', 'club_name',
      'email','updated_at', 'created_on', 'phone',
      'city', 'state', 'address', 'geolat', 'geolng', 'country',
    ];
    const club = {};
    fields.forEach(field => {
      if (row[field]) {
        club[field] = row[field];
      }
    });

    return club;
  }

  static mobileFormat(row) {
    const fields = [
      'id', 'password_digest', 'session_token',
      'short_id', 'username', 'club_name',
      'email', 'verified', 'token',
      'confirm_token', 'updated_at', 'created_on',
      'city', 'state', 'address', 'geolat', 'geolng', 'country',
    ];
    const club = {};
    fields.forEach(field => {
      if (row[field]) {
        club[camelCase(field)] = row[field];
      }
    });

    return club;
  }

  static async detail(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT
        c.id, short_id, club_name, phone, session_token, confirm_token,
        city, state, address, geolat, geolng, country
        FROM clubs
        WHERE id = ?
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

  static async mobileDetail(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT
          short_id, club_name, verified,
          phone, address, geolat, geolng,
          city, state, country
        FROM clubs AS c
        INNER JOIN club_geolocations AS cg
        ON cg.club_id = c.id
        WHERE c.id = ?
      `, [id], async (err, results, field) => {
        connection.release();
        if (err) throw err;
        console.log(results);
        if (results.length > 0) {
          const club = Club.formatClubRow(results[0]);
          club.pastSessions = await RoundRobin.getPastSessions(id);
          resolve(club);
        } else {
          reject({ club: 'Club not found.' });
        }
      });
    });
  }

  static async find(id) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT c.id, short_id, username, club_name, email, verified,
        city, state, address, geolat, geolng, country
        FROM clubs As c
        INNER JOIN club_geolocations AS cg
        ON cg.club_id = c.id
        WHERE c.id = ?
      `, [id], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.length > 0) {
          const club = Club.mobileFormat(results[0]);
          resolve(club);
        } else {
          reject({ club: 'Club not found.' });
        }
      });
    });
  }

  static async mobileAll() {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT short_id, club_name, email,
        city, state, address, geolat, geolng, country
        FROM clubs AS c
        INNER JOIN club_geolocations AS cg
        ON cg.club_id = c.id
      `, async (err, results, field) => {
        connection.release();
        if (err) throw(err);
        const clubs = results.map(r => Club.mobileFormat(r));
        resolve(clubs);
      });
    });
  }

  static async all() {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT c.id, short_id, club_name, email,
        city, state, address, geolat, geolng, country
        FROM clubs AS c
        INNER JOIN club_geolocations AS cg
        ON cg.club_id = c.id
      `, async (err, results, field) => {
        connection.release();
        if (err) throw(err);
        const clubs = results.map(r => Club.formatClubRow(r));
        const sessions = await RoundRobin.findAllBriefByClub(clubs.map(c => c.id));
        const sessionClubMap = {};
        for (const session of sessions) {
          if (!sessionClubMap[session.club_id]) {
            sessionClubMap[session.club_id] = []
          }
          sessionClubMap[session.club_id].push(session);
        }

        clubs.forEach(club => {
          club.sessions = sessionClubMap[club.id] || [];
        });
        resolve(clubs);
      });
    });
  }

  static async confirm(token) {
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

  // static async changeInfo(club, data) {
  //   const { password, info } = data;
  //   {
  //     const error = ClubValidation.validateInfo(info);
  //     if (error) throw error;
  //   }
  //   try {
  //     const isPassword = await bcrypt.isPassword(password, club.password_digest);
  //   } catch (_e) {
  //     return Promise.reject({ password: "Password is incorrect" });
  //   }
  //   const connection = await db.getConnection();
  //   return new Promise((resolve, reject) => {
  //     connection.beginTransaction((tError) => {
  //       if (tError) throw tError;
  //       if (info.email && club.email !== info.email) {
  //         connection.query(`UPDATE clubs
  //           SET email = ?, verified = 0, confirm_token = ?
  //           WHERE id = ?`, [info.email, Club.generateToken(), club.id], (err, results, field) => {
  //           if (err) {
  //             connection.rollback();
  //             connection.release();
  //             if (err.code === 'ER_DUP_ENTRY') {
  //               if (err.sqlMessage.match(/email/)) {
  //                 return reject({ email: 'Email has been taken' });
  //               }
  //             }
  //             throw err;
  //           }
  //           if (results.affectedRows > 0) {
  //             resolve(true);
  //           } else {
  //             reject({ email: 'Failed to update email.' });
  //           }
  //         });
  //       } else {
  //         resolve(true);
  //       }
  //      });
  //   }).then(() => {
  //     return new Promise((resolve, reject) => {
  //       if (club.address !== info.address ||
  //         club.city !== info.city ||
  //         club.state !== info.state ||
  //         club.country !== info.country
  //       ) {
  //         connection.query(`
  //           UPDATE club_geolocations
  //           SET address = ?, city = ?, state = ?, country = ?, geolat = ?, geolng = ?
  //           WHERE club_id = ?`,
  //           [info.address, info.city, info.state, info.country, info.geolat, info.gelng, club.id],
  //           (err, results, field) => {
  //             if (err) {
  //               connection.rollback();
  //               connection.release();
  //               throw err;
  //             }
  //             connection.commit();
  //             connection.release();
  //             if (results.affectedRows > 0) {
  //               resolve(true);
  //             } else {
  //               reject({ info: 'Failed to update info.' });
  //             }
  //           });
  //       } else {
  //         connection.commit();
  //         connection.release();
  //         resolve(true);
  //       }
  //     });
  //   })
  // }

  // static async changePassword(club, data) {
  //   const { oldPassword, newPassword } = data;
  //   if (newPassword.length < 8) {
  //     return Promise.reject({ newPassword: "Password must have at least 8 characters." });
  //   }

  //   if (oldPassword === newPassword) {
  //     return Promise.resolve();
  //   }

  //   const connection = await db.getConnection();
  //   try {
  //     console.log(club);
  //     const isPassword = await bcrypt.isPassword(oldPassword, club.password_digest);
  //   } catch (e) {
  //     console.log(e);
  //     return Promise.reject({ oldPassword: "Old password is incorrect." });
  //   }
  //   const digest = await bcrypt.generatePasswordDigest(newPassword);
  //   return new Promise((resolve, reject) => {
  //     connection.query(`
  //       UPDATE clubs
  //       SET password_digest = ?
  //       WHERE id = ?`, [digest, club.id], (err, results, field) => {
  //       connection.release();
  //       if (err) throw(err);
  //       if (results.affectedRows > 0) {
  //         resolve(true);
  //       } else {
  //         // Raven.captureException({
  //         //   logging_reason: 'Exploits',
  //         //   error_description: 'Users attempted to call change password directly.'
  //         // });
  //         reject({ user: 'User doesn\'t exist.' });
  //       }
  //     });
  //   });
  // }


  static async updateInformation(conn, info, clubId) {
    let connection = conn;
    if (conn) {
      connection = await db.getConnection();
    }
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      ['club_name', 'phone', 'city', 'state', 'address', 'geolat', 'geolng'].forEach((field) => {
        const fieldKey = camelCase(field);
        if (info[fieldKey]) {
          fields.push(`${field} = ?`);
          values.push(info[fieldKey]);
        }
      });

      const stmt = `UPDATE clubs SET ${fields.join(', ')}`;
      connection.query(`
        ${stmt} WHERE id = ?
      `, [...values, clubId], (err, results, field) => {
        if (err) {
          connection.rollback();
          connection.release();
          throw(err);
        }
        connection.commit();
        connection.release();
        resolve(clubId);
      });
    });
  }

  static async initialInformation(userId, info, conn) {
    // should present an option to select whether it is a club or player..?
    // in the meantime, all web signups are clubs
    // without clubName means init page
    let connection = conn;
    if (!conn) {
      connection = await db.getConnection();
    }
    let city = '';
    let state = '';
    let country = '';
    if (info.address.terms.length === 4) {
      [, city, state, country] = info.address.terms.map(t => t.value);
    } else if (info.address.terms.length === 5) {
      [, , city, state, country] = info.address.terms.map(t => t.value);
    }
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE clubs SET
        club_name = ?, phone = ?, address = ?,
        city = ?, state = ?, country = ?,
        geolat = ?, geolng = ?
        WHERE user_id = ? AND EXISTS (
          SELECT * FROM (SELECT * FROM clubs WHERE user_id = ? AND club_name IS NULL) AS c
        );
      `, [
        info.clubName, info.phone, info.address.description,
        city, state, country,
        info.lat, info.lng, userId, userId
      ], (err, results, field) => {
        if (err) {
          if (conn) {
            connection.rollback();
          }
          connection.release();
          throw(err);
        }
        if (conn) {
          connection.commit();
        } else {
          connection.release();
        }
        console.log(results);
        if (results.affectedRows === 0) {
          reject({ info: 'Failed to update' });
        } else {
          resolve(userId);
        }
      });
    });
  }

  // static async resetPasswordWithToken(token, newPassword) {
  //   const connection = await db.getConnection();
  //   return bcrypt.generatePasswordDigest(newPassword)
  //     .then((digest) => {
  //       return new Promise((resolve, reject) => {
  //         connection.query(`
  //          UPDATE clubs
  //          SET password_digest = ?, token = ?
  //          WHERE token = ?
  //         `, [digest, "", token], (err, results, field) => {
  //           connection.release();
  //           if (err) throw(err);
  //           if (results.affectedRows > 0) {
  //             resolve(results);
  //           } else {
  //             reject({ token: 'Session token might have expired.' });
  //           }
  //         });
  //       });
  //     });
  // }

  static async findBasicInfo(geolocation) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
       SELECT  FROM clubs WHERE username = ?
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
          const isPassword = await bcrypt.isPassword(password, digest);
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

  static async resetPassword({ email, username }) {
    const connection = await db.getConnection();
    const token = Club.generateToken();
    return new Promise((resolve, reject) => {
      connection.query(`
        UPDATE clubs
        SET token = ?
        WHERE email = ? OR username = ?;
      `, [token, email, username], async (err, results, field) => {
        if (err) {
          connection.release();
          throw(err);
        }
        if (results.affectedRows === 0) {
          connection.release();
          return reject({ user: 'User does not exist.' });
        } else {
          const club = await new Promise((resolve, reject) => {
            connection.query(`
              SELECT * FROM clubs
              WHERE token = ? AND (email = ? OR username = ?)
            `, [token, email, username], (err, results, field) => {
              connection.release();
              if (err) throw(err);

              if (results.length > 0) {
                resolve(Club.formatClubRow(results[0]));
              } else {
                reject({ internal: 'Internal Server Error. Something went wrong.' });
              }
            })
          });
          resolve(club);
        }
      });
    });
  }

  static async createInitial(userId, conn) {
    let connection = conn;
    if (conn) {
      connection = await db.getConnection();
    }
    return new Promise((resolve, reject) => {
      connection.query(`
       INSERT INTO clubs (user_id) VALUES (?);
      `, [userId], (err, results, field) => {
          if (!conn) connection.release();
          if (err) {
            if (conn) {
              connection.rollback();
              connection.release();
            }
            throw err;
          }

        return resolve(true);
      });
    });

  }
}

export default Club;
