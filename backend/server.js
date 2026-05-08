const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const initDB = require('./initDB');
const authRoutes = require('./routes/auth');
const appRoutes = require('./routes/applications');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', appRoutes);  // handles /api/applications AND /api/applications/admin/*
app.use('/api/admin/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Start
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 InternPort API running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('Failed to init DB:', err.message);
  process.exit(1);
});