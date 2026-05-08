const pool = require('./database');
const bcrypt = require('bcryptjs');

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        hashed_password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Safely add 'name' column if upgrading from an older schema that didn't have it
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)
    `);

    // Applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(255) NOT NULL,
        skills TEXT,
        cover_letter TEXT,
        resume_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed admin user if not exists
    const { rows } = await client.query("SELECT id FROM users WHERE email = $1", ['admin@internport.com']);
    if (rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await client.query(
        "INSERT INTO users (email, hashed_password, is_admin) VALUES ($1, $2, TRUE)",
        ['admin@internport.com', hashed]
      );
      console.log('🔑 Admin user seeded: admin@internport.com / admin123');
    }

    await client.query('COMMIT');
    console.log('✅ Database tables ready');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ DB init failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initDB;