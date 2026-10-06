const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
});

// Test connection on boot
pool.getConnection()
  .then((conn) => {
    console.log(' Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'ecommerce_db'));
    conn.release();
  })
  .catch((err) => {
    console.error(' MySQL Connection Error:', err.message);
  });

module.exports = pool;
