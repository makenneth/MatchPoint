import pool from './pool';
import { client } from "../helpers/appModules";

class DB {
  static getConnection() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          client.set(`error:pool:${Date.now()}`, JSON.stringify(err));
          throw err;
        }
        resolve(connection);
      });
    });
  }
}

export default DB;
