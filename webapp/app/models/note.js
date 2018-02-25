import mysql from "mysql";
import { camelCase } from 'lodash';
import db from '../utils/connection';

function Note() {
  return {
    new: async function(clubId, type, note) {
      if (note.length >= 500) {
        return Promise.reject({ note: 'Note cannot be longer than 500 characters.' });
      }
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE clubs
          SET ${type}_note = ?
          WHERE id = ?
        `, [note, clubId], async (err, results, field) => {
          connection.release();
          if (err) {
            throw(err);
          }
          return resolve(results.insertId);
        });
      });
    },
  };
}

export default Note();
