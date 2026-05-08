const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../database');
const { adminMiddleware } = require('../auth');

// Multer setup
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${(req.body.email || 'user').replace('@', '_')}_${(req.body.position || 'pos').replace(/\s/g, '_')}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX allowed'));
  }
});

// POST /api/applications - public submit
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, position, skills, cover_letter } = req.body;

    if (!name || !email || !phone || !position || !skills) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check duplicate
    const dup = await pool.query(
      'SELECT id FROM applications WHERE email = $1 AND position = $2',
      [email, position]
    );
    if (dup.rows.length > 0) {
      return res.status(400).json({ error: 'You already applied for this position' });
    }

    const resume_path = req.file ? req.file.filename : null;

    const { rows } = await pool.query(
      `INSERT INTO applications (name, email, phone, position, skills, cover_letter, resume_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, email, phone, position, skills, cover_letter || '', resume_path]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// GET /api/admin/applications
router.get('/admin', adminMiddleware, async (req, res) => {
  try {
    const { search = '', status = '', position = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR skills ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (position) {
      conditions.push(`position ILIKE $${idx}`);
      params.push(`%${position}%`);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM applications ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    const pages = Math.max(1, Math.ceil(total / parseInt(limit)));

    const itemsRes = await pool.query(
      `SELECT * FROM applications ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ total, pages, items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/admin/applications/:id
router.get('/admin/:id', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/applications/:id/status
router.patch('/admin/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'selected', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { rows } = await pool.query(
      'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/applications/:id
router.delete('/admin/:id', adminMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications/mine - student sees their own applications
router.get('/mine', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const { verifyToken } = require('../auth');
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    const { rows } = await pool.query(
      'SELECT id, name, email, position, skills, status, created_at, updated_at FROM applications WHERE email = $1 ORDER BY created_at DESC',
      [payload.sub]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
