var pool = require('./pool');

class DB {
  static getConnection() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        resolve(connection);
      });
    });
  }
}

export default DB;
