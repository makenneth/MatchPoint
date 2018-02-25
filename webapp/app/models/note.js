import mysql from "mysql";
import { camelCase } from 'lodash';
import db from '../utils/connection';

function Note() {
  return {
    create: async function(clubId, type, note) {
      if (note.length > 300) {
        return Promise.reject({ note: 'Note cannot be longer than 300 characters.' });
      }
      const connection = await db.getConnection();
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE clubs
          SET ${type}_note = ?
          WHERE id = ?
        `, [note, clubId], async (err, results, field) => {
          connection.release();
          console.log(err);
          if (err) {
            throw(err);
          }
          console.log('created', results);
          return resolve(true);
        });
      });
    },
  };
}

export default Note();
