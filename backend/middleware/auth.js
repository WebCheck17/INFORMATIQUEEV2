const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await db.query(
      `SELECT u.*, r.name as role_name, r.slug as role_slug 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }
    
    req.user = result.rows[0];
    next();
    
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token sudah expired' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
        [decoded.userId]
      );
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };