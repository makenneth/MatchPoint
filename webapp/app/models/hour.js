import { camelCase } from 'lodash';
import moment from 'moment';
import db from '../utils/connection';
import validation from '../validations/hour';

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
    getHours: async function(clubId, conn) {
      let connection = conn;

      if (!connection) {
        connection = await db.getConnection();
      }
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT h.*
          FROM hours AS h
          INNER JOIN club_hours AS ch
          ON h.id = ch.hour_id
          WHERE ch.club_id = ?
          ORDER BY h.day, h.open;
        `, [clubId], async (err, results, field) => {
          connection.release();
          if (err) {
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
      console.log('getHour', clubId, hourId);
      return new Promise((resolve, reject) => {
        connection.query(`
          SELECT h.*
          FROM hours AS h
          INNER JOIN club_hours AS ch
          ON h.id = ch.hour_id
          WHERE ch.club_id = ? AND h.id = ?;
        `, [clubId, hourId], async (err, results, field) => {
          connection.release();
          if (err) {
            throw(err);
          }
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
      const scheduleError = validation.validate(hour, type);
      if (scheduleError) {
        throw scheduleError;
      }
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
              moment(hour.open).format('YYYY-MM-DD HH:mm:ss'),
              moment(hour.close).format('YYYY-MM-DD HH:mm:ss')
            ], (err, results, field) => {
            if (err) {
              connection.rollback();
              connection.release();
              throw(err);
            }
            resolve(results.insertId);
          });
        });
      });

      return new Promise((resolve) => {
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
          return resolve(hourId);
        });
      });
    },

    updateHour: async function(clubId, hourId, hour) {
      const scheduleError = validation.validate(hour);
      if (scheduleError) {
        throw scheduleError;
      }
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE hours
          SET day = ?, open = ?, close = ?
          WHERE id = ? AND EXISTS (
            SELECT * FROM club_hours
            WHERE club_id = ? AND hour_id = ?
          );
        `, [
          hour.day,
          moment(hour.open).format('YYYY-MM-DD HH:mm:ss'),
          moment(hour.close).format('YYYY-MM-DD HH:mm:ss'),
          hourId, clubId, hourId], (err, results, field) => {
            connection.release();
            console.log(err, results);
            if (err) {
              reject({ code: 500, internal: err });
            } else if (results.affectedRows === 0) {
              reject({ code: 400, hours: 'Unable to update hours.' });
            } else {
              resolve(true);
            }
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
