import URLSafeBase64 from "urlsafe-base64";
import crypto from "crypto";
import bcrypt from "../helpers/bcrypt";
import shortid from "shortid";
import mysql from "mysql";
import { camelCase } from 'lodash';
import db from '../utils/connection';
import RoundRobin from './roundrobin';
import Hour from './hour';
import ClubValidation from "../validations/club";

class Club {
  static generateToken() {
    return URLSafeBase64.encode(crypto.randomBytes(32));
  }

  static format(row) {
    const fields = [
      'id', 'short_id', 'club_name',
      'email','updated_at', 'created_on', 'phone',
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
        id, club_name, phone, city, state, address, geolat, geolng, country
        FROM clubs
        WHERE id = ?
      `, [id], async (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.length > 0) {
          const club = Club.format(results[0]);
          try {
            const hours = await Hour.getHours(id);
            resolve({ ...club, ...hours });
          } catch (e) {
            reject(e);
          }
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
          const club = Club.format(results[0]);
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
          const club = Club.format(results[0]);
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
        SELECT id, club_name, email, phone
        city, state, address, geolat, geolng, country
        FROM clubs
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
        SELECT id, club_name, phone
        city, state, address, geolat, geolng, country
        FROM clubs
      `, async (err, results, field) => {
        connection.release();
        if (err) {
          console.log(err);
          throw(err);
        }
        const clubs = results.map(r => Club.format(r));
        console.log(clubs)
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

  // static async updateInformation(info, clubId, conn) {
  //   let connection = conn;
  //   if (conn) {
  //     connection = await db.getConnection();
  //   }
  //   return new Promise((resolve, reject) => {
  //     const fields = [];
  //     const values = [];
  //     ['club_name', 'phone', 'city', 'state', 'address', 'geolat', 'geolng'].forEach((field) => {
  //       const fieldKey = camelCase(field);
  //       if (info[fieldKey]) {
  //         fields.push(`${field} = ?`);
  //         values.push(info[fieldKey]);
  //       }
  //     });

  //     const stmt = `UPDATE clubs SET ${fields.join(', ')}`;
  //     connection.query(`
  //       ${stmt} WHERE id = ?
  //     `, [...values, clubId], (err, results, field) => {
  //       if (err) {
  //         connection.rollback();
  //         connection.release();
  //         throw(err);
  //       }
  //       connection.commit();
  //       connection.release();
  //       resolve(clubId);
  //     });
  //   });
  // }

  static async updateInformation(userId, info, conn) {
    // should present an option to select whether it is a club or player..?
    // in the meantime, all web signups are clubs
    // without clubName means init page
    let connection = conn;
    if (!conn) {
      connection = await db.getConnection();
    }
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
    return new Promise((resolve, reject) => {
      console.log('stmt', stmt);
      console.log('values', values);
      connection.query(` ${stmt} WHERE user_id = ?;`, [...values, userId], (err, results, field) => {
      // connection.query(`
      //   UPDATE clubs SET
      //   club_name = ?, phone = ?, address = ?,
      //   city = ?, state = ?, country = ?,
      //   geolat = ?, geolng = ?
      //   WHERE id = ?;
      // `, [
      //   info.clubName, info.phone, info.address,
      //   info.city, info.state, info.country,
      //   info.lat, info.lng, userId
      // ], (err, results, field) => {
        if (err) {
          if (conn) {
            connection.rollback();
          }
          connection.release();
          if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.match(/club_name/)) {
              return reject({ clubName: 'Club Name has been taken' });
            }
          }
          throw(err);
        }
        if (conn) {
          connection.commit();
        } else {
          connection.release();
        }

        if (results.affectedRows === 0) {
          reject({ info: 'Failed to update' });
        } else {
          resolve(userId);
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

  static async search(search) {
    const connection = await db.getConnection();
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT id, club_name, city, state
        FROM clubs
        WHERE LOWER(club_name) LIKE ? OR LOWER(address) LIKE ?;
      `, [`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`], (err, results, field) => {
        connection.release();
        if (err) throw err;
        if (results.length > 0) {
          const clubs = results.map(result => Club.format(result));
          resolve(clubs);
        } else {
          resolve([]);
        }
      });
    });
  }
}

export default Club;
