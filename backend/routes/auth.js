const express = require('express');
const router = express.Router();
const pool = require('../database');
const { hashPassword, verifyPassword, createToken, authMiddleware } = require('../auth');

// POST /api/auth/register - student self-registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await hashPassword(password);
    const { rows } = await pool.query(
      'INSERT INTO users (email, hashed_password, is_admin, name) VALUES ($1, $2, FALSE, $3) RETURNING id, email, is_admin, name',
      [email, hashed, name]
    );
    const user = rows[0];
    const token = createToken({ sub: user.email, is_admin: false, id: user.id });
    res.status(201).json({ access_token: token, token_type: 'bearer', is_admin: false, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !(await verifyPassword(password, user.hashed_password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = createToken({ sub: user.email, is_admin: user.is_admin, id: user.id });
    res.json({ access_token: token, token_type: 'bearer', is_admin: user.is_admin, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, is_admin, name FROM users WHERE email = $1', [req.user.sub]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
