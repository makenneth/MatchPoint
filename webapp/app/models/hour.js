import { camelCase } from 'lodash';
import db from '../utils/connection';
import { validation } from '../validations/hour';

export default (function() {
  function format(results) {
    const hours = {
      roundrobinHours: Array.from(Array(7), _ => []),
      operationHours: Array.from(Array(7), _ => []),
    };
    results.forEach((rows) => {
      hours[`${rows.type}Hours`][rows.day].push(formatRow(rows));
    });

    return hours;
  }

  function formatRow(row) {
    const hour = {};
    ['open', 'close', 'id', 'day', 'type'].forEach((field) => {
      hour[field] = row[field];
    });

    return hour;
  }

  return {
    getHours: async function(clubId) {
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT h.*
          FROM hours AS h
          INNER JOIN club_hours AS ch
          ON h.id = ch.hour_id
          WHERE ch.club_id = ?
          ORDER BY h.day, h.open;
        `, [clubId], async (err, results, field) => {
          if (err) {
            connection.release();
            throw(err);
          }
          if (results.length > 0) {
            return resolve(format(results));
          } else {
            return resolve(format([]));
          }
        });
      });
    },


    getHour: async function(clubId, hourId) {
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT h.*
          FROM hours AS h
          INNER JOIN club_hours AS ch
          ON h.id = ch.hour_id
          WHERE ch.club_id = ? AND h.id = ?;
        `, [clubId, hourId], async (err, results, field) => {
          if (err) {
            connection.release();
            throw(err);
          }
          console.log(results);
          if (results.length > 0) {
            const hours = formatRow(results[0]);
            return resolve(hours);
          } else {
            return resolve({});
          }
        });
      });
    },

    createHour: async function(clubId, type, hour) {
      const connection = await db.getConnection();
      const hourId = await new Promise((resolve, reject) => {
        connection.beginTransaction((tError) => {
          if (tError) throw tError;
          connection.query(`
            INSERT INTO hours (type, day, open, close)
            VALUES (?, ?, ?, ?)
          `, [
              type,
              hour.day,
              hour.open.slice(0, 19).replace('T', ' '),
              hour.close.slice(0, 19).replace('T', ' '),
            ], (err, results, field) => {
            console.log('tried to insert');
            if (err) {
              console.log(err);
              connection.rollback();
              connection.release();
              throw(err);
            }
            resolve(results.insertId);
          });
        });
      });

      const insertToJoin = new Promise((resolve) => {
        connection.query(`
          INSERT INTO club_hours
          (club_id, hour_id)
          VALUES
          (?, ?)
        `, [clubId, hourId], (err, results, field) => {
          if (err) {
            console.log(err);
            connection.rollback();
            connection.release();
            throw(err);
          }
          connection.commit();
          connection.release();
          resolve(true);
        });
      });

      return Promise.resolve(hourId);
    },

    updateHour: async function(clubId, hourId, hour) {
      const scheduleError = ClubValidation.hours(hours);
      if (scheduleError) {
        throw scheduleError;
      }
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE hours AS h
          SET day = ?, open = ?, close = ?
          INNER JOIN clubs AS c
          ON h.club_id = c.id
          WHERE id = ? AND clubId = ?;
        `, [hour.day, hour.open, hour.close, hourId, clubId], (err, results, field) => {
            connection.release();
            if (err) {
              throw({ code: 500, internal: err });
            } else if (results.affectedRows === 0) {
              throw({ code: 400, hours: 'Unable to update hours.' });
            }
            resolve(true);
        });
      });
    },

    deleteHour: async function(clubId, hourId)  {
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          DELETE h.* FROM hours AS h
          INNER JOIN club_hours AS ch
          ON ch.hour_id = h.id
          WHERE ch.club_id = ? AND h.id = ?;
        `, [clubId, hourId], async (err, results, field) => {
          if (err) {
            connection.release();
            throw(err);
          }
          if (results.affectedRows === 0) {
            return reject({ hours: 'Record not found.' });
          } else {
            return resolve(true);
          }
        });
      });
    }
  };
})();
