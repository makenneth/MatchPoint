require('dotenv').config();
import mysql from 'mysql';

const pool = mysql.createPool({
  connectionLimit: 50,
  host: process.env.HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB || 'matchpoints',
});

export default pool;
