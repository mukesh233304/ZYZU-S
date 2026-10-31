const { Pool } = require('pg');
const config = require('../config');

const connectionString = process.env.INSFORGE_DATABASE_URL ||
  'postgresql://postgres:93ee7b193b1017f17c44e54970f8a658@2vp4avxh.ap-southeast.database.insforge.app:5432/insforge?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('[InsForge Pool] Unexpected error on idle client:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('[InsForge Pool Query Error]', { text: text.slice(0, 100), error: err.message });
    throw err;
  }
}

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, version() as version;');
    return { connected: true, timestamp: res.rows[0].now, version: res.rows[0].version };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
