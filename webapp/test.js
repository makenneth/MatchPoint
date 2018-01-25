require('dotenv').config()
var mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  acquireTimeout: 30000,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.PORT || 3306,
  database: process.env.DB || 'matchpoints_test',
  connectionTimeout: 30000,
  debug: true,
  queueLimit: 50,
});

pool.getConnection((err, connection) => {
  console.log(err);
  console.log(connection);
  process.exit(0);
})
