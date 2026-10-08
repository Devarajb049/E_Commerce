const { Pool } = require('pg');
const dotenv = require('dotenv');
const { querySqlite, getSqliteDb } = require('./sqliteStore');

dotenv.config();

let pgPool = null;
let useSqliteFallback = false;

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (connectionString) {
  try {
    const isSupabase = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com');
    
    pgPool = new Pool({
      connectionString,
      ssl: isSupabase || process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection on boot
    pgPool.query('SELECT 1 + 1 AS connection_test')
      .then(() => {
        console.log('✅ Successfully connected to Supabase PostgreSQL database.');
      })
      .catch((err) => {
        console.warn(`⚠️ PostgreSQL connection warning (${err.message}). Active engine: embedded SQLite fallback.`);
        useSqliteFallback = true;
        getSqliteDb();
      });
  } catch (err) {
    console.warn(`⚠️ Failed to initialize PostgreSQL pool (${err.message}). Falling back to SQLite.`);
    useSqliteFallback = true;
    getSqliteDb();
  }
} else {
  console.log('ℹ️ No DATABASE_URL found in environment. Using embedded SQLite store.');
  console.log('👉 To connect to Supabase: add DATABASE_URL=postgresql://postgres:[PASSWORD]@db.zvnihfslrdnvyujxyiov.supabase.co:5432/postgres in .env');
  useSqliteFallback = true;
  getSqliteDb();
}

/**
 * Convert MySQL '?' placeholders to PostgreSQL '$1, $2, $3...' placeholders
 */
function convertPlaceholders(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

const db = {
  get isSqlite() {
    return useSqliteFallback;
  },

  get isPostgres() {
    return !useSqliteFallback && Boolean(pgPool);
  },

  /**
   * Execute parameterized query against PostgreSQL or fallback store
   * Returns [rows, metadata] to maintain unified API across all controllers
   */
  async query(sql, params = []) {
    if (!useSqliteFallback && pgPool) {
      try {
        const pgSql = convertPlaceholders(sql);
        const res = await pgPool.query(pgSql, params);
        
        // Synthesize insertId for INSERT statements with RETURNING
        const rows = res.rows || [];
        const resultMeta = {
          ...res,
          insertId: rows[0]?.id || rows[0]?.product_id || rows[0]?.order_id || rows[0]?.category_id || rows[0]?.address_id || null,
          affectedRows: res.rowCount,
          rowCount: res.rowCount
        };

        return [rows, resultMeta];
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
          console.warn('⚠️ PostgreSQL connection lost. Falling back to SQLite store.');
          useSqliteFallback = true;
          return await querySqlite(sql, params);
        }
        throw err;
      }
    }

    return await querySqlite(sql, params);
  },

  /**
   * Acquire a dedicated client for atomic database transactions
   */
  async getConnection() {
    if (!useSqliteFallback && pgPool) {
      try {
        const client = await pgPool.connect();
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
        useSqliteFallback = true;
      }
    }

    // Mock transaction connection for SQLite fallback
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
