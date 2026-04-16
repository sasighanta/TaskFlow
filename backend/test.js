const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Error connecting:", err);
  } else {
    console.log("Connected! Time:", res.rows[0]);
  }
});