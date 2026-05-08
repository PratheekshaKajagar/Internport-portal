const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'internport-secret-key-change-in-production';

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { hashPassword, verifyPassword, createToken, verifyToken, authMiddleware, adminMiddleware };
