const express = require('express');
const router = express.Router();
const pool = require('../database');
const { adminMiddleware } = require('../auth');

// GET /api/admin/stats
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const [total, pending, selected, rejected, positions] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'selected'"),
      pool.query("SELECT COUNT(*) FROM applications WHERE status = 'rejected'"),
      pool.query("SELECT position, COUNT(*) as count FROM applications GROUP BY position ORDER BY count DESC")
    ]);

    res.json({
      total: parseInt(total.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      selected: parseInt(selected.rows[0].count),
      rejected: parseInt(rejected.rows[0].count),
      positions: positions.rows.map(r => ({ position: r.position, count: parseInt(r.count) }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
