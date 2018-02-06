import { camelCase } from 'lodash';
import db from '../utils/connection';
import { validation } from '../validations/hour';

export default function() {
  function format(results) {
    const hours = {
      roundrobinHours: Array.from(Array(7), _ => new Array(7)),
      operationHous: Array.from(Array(7), _ => new Array(7)),
    };
    results.forEach((rows) => {
      hours[`${row.type}Hours`][rows.day].push(formatRow(rows));
    });

    return hours;
  }

  function formatRow(row) {
    const hour = {};
    ['open', 'close', 'id', 'day'].forEach((field) => {
      hour[field] = row[field];
    });

    return hour;
  }

  return {
    getHour: async function(clubId) {
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT h.*
          FROM hours AS h
          INNER JOIN club_hours AS ch
          ON h.id = ch.hour_id
          WHERE ch.club_id = 1
          ORDER BY h.day, h.open;
        `, [clubId, hourId], async (err, results, field) => {
          if (err) {
            connection.release();
            throw(err);
          }
          if (results.length > 0) {
            const hours = formatRows(results);
            return resolve(hours);
          } else {
            return resolve({});
          }
        });
      });
    },

    createHour: async function(clubId, type, hour) {
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.beginTransaction((tError) => {
          if (tError) throw tError;
          connection.query(`
            INSERT INTO hours (type, day, open, close)
            VALUES (?, ?, ?)
          `, [type, hour.day, hours.open, hours.close], (err, results, field) => {
            if (err) {
              connection.rollback();
              connection.release();
              throw(err);
            }
            resolve(results.insertId);
          });
        })
      }).then((hourId) => {
        connection.query(`
          INSERT INTO club_hours
          (club_id, hourId)
          VALUES
          (?, ?)
        `, [clubId, hourId], (err, results, field) => {
          if (err) {
            connection.rollback();
            connection.release();
            throw(err);
          }
          resolve(true);
        });
      });
    }

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

    }
  };
}();
