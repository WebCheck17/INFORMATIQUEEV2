const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    
    const result = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
    
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  const notificationId = parseInt(req.params.id);
  
  if (isNaN(notificationId)) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }
  
  try {
    const userId = req.user?.id || 1;
    
    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
    
    res.json({ success: true });
    
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    
    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    
    res.json({ success: true });
    
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;