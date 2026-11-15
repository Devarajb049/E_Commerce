/**
 * ClickCart Production Database Layer
 * Dual-Engine Architecture: Supabase Hosted PostgreSQL with Zero-Crash Embedded Fallback
 * Built with 'pg' (node-postgres) and 'sql.js' (embedded WASM SQLite)
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { querySqlite, getSqliteConnection, getSqliteDb } = require('./sqliteStore');

// Ensure environment variables are loaded from server and root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

let postgresPool = null;
let postgresConnected = false;
let connectionAttemptComplete = false;
let postgresErrorNotice = null;

// Configure PostgreSQL pool if connection string is provided
if (connectionString && typeof connectionString === 'string' && connectionString.trim() !== '') {
  try {
    postgresPool = new Pool({
      connectionString: connectionString.trim(),
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    postgresPool.on('error', (err) => {
      console.warn('⚠️ Idle PostgreSQL client warning:', err.message);
    });

    // Test PostgreSQL connectivity on boot
    postgresPool
      .query('SELECT 1 + 1 AS connection_test')
      .then(() => {
        postgresConnected = true;
        connectionAttemptComplete = true;
        console.log('✅ Connected to Supabase PostgreSQL database.');
      })
      .catch((err) => {
        postgresConnected = false;
        connectionAttemptComplete = true;
        postgresErrorNotice = err.message;
        console.warn('⚠️ Notice: Supabase PostgreSQL is unreachable or paused (' + err.message + ').');
        console.log('🛡️ Activating embedded database engine — all ClickCart features remain fully functional.');
        // Pre-initialize embedded store
        getSqliteDb().catch(() => {});
      });
  } catch (err) {
    postgresConnected = false;
    connectionAttemptComplete = true;
    postgresErrorNotice = err.message;
    console.warn('⚠️ PostgreSQL pool initialization error:', err.message);
  }
} else {
  connectionAttemptComplete = true;
  console.log('ℹ️ No DATABASE_URL configured. Running on resilient embedded catalog store.');
  getSqliteDb().catch(() => {});
}

/**
 * Convert MySQL '?' placeholders to PostgreSQL '$1, $2, $3...' positional parameters
 */
function convertPlaceholders(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

const db = {
  get pool() {
    return postgresPool;
  },

  get isPostgres() {
    return postgresConnected;
  },

  get isSqlite() {
    return !postgresConnected;
  },

  /**
   * Check connection status for /api/health
   */
  async checkConnection() {
    if (postgresPool) {
      try {
        const start = Date.now();
        await postgresPool.query('SELECT 1 + 1 AS test');
        const latency = Date.now() - start;
        return {
          connected: true,
          engine: 'supabase-postgres',
          latency_ms: latency,
          name: 'postgres'
        };
      } catch (err) {
        return {
          connected: false,
          engine: 'sqlite-fallback',
          notice: 'Supabase PostgreSQL is unreachable (' + err.message + '). Serving requests via persistent embedded store.',
          name: 'clickcart_db'
        };
      }
    }

    return {
      connected: false,
      engine: 'sqlite-embedded',
      notice: 'Operating on built-in embedded store. Configure DATABASE_URL in production environment to connect to Supabase PostgreSQL.',
      name: 'clickcart_db'
    };
  },

  /**
   * Execute parameterized query across PostgreSQL or resilient SQLite fallback
   * Returns [rows, resultMeta]
   */
  async query(sql, params = []) {
    // If PostgreSQL pool is active and previously verified, try PostgreSQL first
    if (postgresPool && postgresConnected) {
      try {
        const pgSql = convertPlaceholders(sql);
        const res = await postgresPool.query(pgSql, params);
        const rows = res.rows || [];
        const resultMeta = {
          ...res,
          insertId: rows[0]?.id || rows[0]?.product_id || rows[0]?.order_id || rows[0]?.category_id || rows[0]?.address_id || null,
          affectedRows: res.rowCount,
          rowCount: res.rowCount
        };
        return [rows, resultMeta];
      } catch (pgError) {
        // If connection dropped, fallback to SQLite
        const isConnectionError =
          pgError.code === 'ECONNREFUSED' ||
          pgError.code === 'ENOTFOUND' ||
          pgError.code === 'ETIMEDOUT' ||
          pgError.message?.includes('tenant/user') ||
          pgError.message?.includes('Connection terminated');

        if (isConnectionError) {
          postgresConnected = false;
          console.warn('⚠️ Supabase connection lost, falling back to embedded store:', pgError.message);
          return querySqlite(sql, params);
        }
        throw pgError;
      }
    }

    // Default to embedded fallback
    return querySqlite(sql, params);
  },

  /**
   * Acquire a dedicated connection for transactions (BEGIN / COMMIT / ROLLBACK)
   */
  async getConnection() {
    if (postgresPool && postgresConnected) {
      try {
        const client = await postgresPool.connect();
        return {
          async query(sql, params = []) {
            const pgSql = convertPlaceholders(sql);
            const res = await client.query(pgSql, params);
            const rows = res.rows || [];
            const resultMeta = {
              ...res,
              insertId: rows[0]?.id || rows[0]?.product_id || rows[0]?.order_id || null,
              affectedRows: res.rowCount,
              rowCount: res.rowCount
            };
            return [rows, resultMeta];
          },
          async beginTransaction() {
            await client.query('BEGIN');
          },
          async commit() {
            await client.query('COMMIT');
          },
          async rollback() {
            await client.query('ROLLBACK');
          },
          release() {
            client.release();
          }
        };
      } catch (err) {
        postgresConnected = false;
        console.warn('⚠️ PostgreSQL transaction client error, using embedded transaction:', err.message);
        return getSqliteConnection();
      }
    }

    return getSqliteConnection();
  }
};

module.exports = db;
