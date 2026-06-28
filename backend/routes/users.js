const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.name, u.avatar, u.nim, u.kelas, u.jurusan, u.bio, u.gender, u.phone, u.is_active, u.last_login, u.created_at,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC`
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.name, u.avatar, u.nim, u.kelas, u.jurusan, u.bio, u.gender, u.phone, u.is_active, u.last_login, u.created_at,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;