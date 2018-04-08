require('dotenv').config();
let mysql = require('mysql');
let pool = mysql.createPool({
  connectionLimit: 50,
  host: process.env.HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB || 'matchpoints_sub',
});

(function() {
  pool.getConnection((err, connection) => {
    connection.query(`
      SELECT id, player_id, result
      FROM player_histories
      WHERE club_id = ? AND result IS NOT NULL
      ORDER BY player_id ASC
    `, [34], (err, results) => {
      if (err) {
        throw err;
      }

      results.forEach((row) => {
        let result = JSON.parse(row.result);
        let gameWon = 0;
        let matchWon = 0;
        Object.keys(result).forEach((oppId) => {
          let match = result[oppId];
          let self = match[0];
          let other = match[1];
          if (self === 3) matchWon++;
          gameWon += self;
        })
        connection.query(`
          UPDATE player_histories
          SET game_won = ?, match_won = ?
          WHERE id = ? AND player_id = ?
        `, [gameWon, matchWon, row.id, row.player_id], (err, results) => {
          if (err) {
            console.log(err);
          }
        })
      });
    });
  });
})()
