const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/activity-logs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.*, u.name as user_name, u.avatar as user_avatar
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get activity logs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/activity-logs
router.post('/', async (req, res) => {
  const { action, description, subject_type, subject_id, properties } = req.body;
  
  if (!action) {
    return res.status(400).json({ error: 'Action wajib diisi' });
  }
  
  try {
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    const result = await db.query(
      `INSERT INTO activity_logs (user_id, action, description, subject_type, subject_id, properties, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, action, description, subject_type, subject_id, JSON.stringify(properties || {}), ipAddress, userAgent]
    );
    
    res.status(201).json({ id: result.rows[0].id });
    
  } catch (err) {
    console.error('Create activity log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;