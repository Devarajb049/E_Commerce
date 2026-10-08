const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { querySqlite, getSqliteDb } = require('./sqliteStore');

dotenv.config();

let useSqliteFallback = false;
let mysqlPool = null;

try {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true,
    connectTimeout: 2000
  });

  // Test connection on boot with short timeout
  mysqlPool.getConnection()
    .then((conn) => {
      console.log('✅ Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'ecommerce_db'));
      conn.release();
    })
    .catch((err) => {
      console.warn('⚠️ MySQL connection unavailable (' + err.message + '). Active engine: embedded SQLite with production catalog.');
      useSqliteFallback = true;
      getSqliteDb();
    });
} catch (e) {
  useSqliteFallback = true;
  getSqliteDb();
}

const db = {
  get isSqlite() {
    return useSqliteFallback;
  },

  async query(sql, params = []) {
    if (!useSqliteFallback && mysqlPool) {
      try {
        return await mysqlPool.query(sql, params);
      } catch (err) {
        // If MySQL server is down or unreachable, seamlessly fallback to SQLite
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') {
          useSqliteFallback = true;
          return await querySqlite(sql, params);
        }
        throw err;
      }
    }
    return await querySqlite(sql, params);
  },

  async getConnection() {
    if (!useSqliteFallback && mysqlPool) {
      try {
        const conn = await mysqlPool.getConnection();
        return conn;
      } catch (err) {
        useSqliteFallback = true;
      }
    }

    // Return mock connection wrapper for SQLite
    return {
      async query(sql, params = []) {
        return await querySqlite(sql, params);
      },
      async beginTransaction() {
        return;
      },
      async commit() {
        return;
      },
      async rollback() {
        return;
      },
      release() {
        return;
      }
    };
  }
};

module.exports = db;
