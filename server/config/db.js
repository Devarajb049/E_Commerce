/**
 * Supabase PostgreSQL Database Connection Pool
 * Built with 'pg' (node-postgres)
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to root .env if present

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL: DATABASE_URL environment variable is missing.');
  console.error('👉 Please configure DATABASE_URL in server/.env with your Supabase PostgreSQL connection string.');
}

// Configure PostgreSQL pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
});

// Test connection on boot
pool.query('SELECT 1 + 1 AS connection_test')
  .then(() => {
    console.log('✅ Connected to Supabase PostgreSQL database.');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to Supabase PostgreSQL:', err.message);
  });

/**
 * Convert MySQL '?' placeholders to PostgreSQL '$1, $2, $3...' positional parameters
 */
function convertPlaceholders(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

const db = {
  pool,

  get isPostgres() {
    return true;
  },

  /**
   * Execute parameterized query against Supabase PostgreSQL
   * Returns [rows, resultMeta] to maintain consistent API across all controllers
   */
  async query(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params);
    const rows = res.rows || [];
    const resultMeta = {
      ...res,
      insertId: rows[0]?.id || rows[0]?.product_id || rows[0]?.order_id || rows[0]?.category_id || rows[0]?.address_id || null,
      affectedRows: res.rowCount,
      rowCount: res.rowCount
    };
    return [rows, resultMeta];
  },

  /**
   * Acquire a dedicated client from pool for atomic transactions (BEGIN/COMMIT/ROLLBACK)
   */
  async getConnection() {
    const client = await pool.connect();
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
  }
};

module.exports = db;
