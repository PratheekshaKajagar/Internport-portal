const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'internport',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log(`✅ PostgreSQL connected @ ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
});

module.exports = pool;
