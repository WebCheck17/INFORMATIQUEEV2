const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/chat/rooms
router.get('/rooms', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cr.*, u.name as created_by_name,
              (SELECT COUNT(*) FROM messages WHERE room_id = cr.id AND deleted_at IS NULL) as message_count
       FROM chat_rooms cr
       LEFT JOIN users u ON cr.created_by = u.id
       WHERE cr.is_active = true AND cr.deleted_at IS NULL
       ORDER BY cr.created_at DESC`
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get chat rooms error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/rooms/:id
router.get('/rooms/:id', async (req, res) => {
  const roomId = parseInt(req.params.id);
  
  if (isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }
  
  try {
    const result = await db.query(
      `SELECT cr.*, u.name as created_by_name
       FROM chat_rooms cr
       LEFT JOIN users u ON cr.created_by = u.id
       WHERE cr.id = $1 AND cr.deleted_at IS NULL`,
      [roomId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/rooms/:id/messages
router.get('/rooms/:id/messages', async (req, res) => {
  const roomId = parseInt(req.params.id);
  
  if (isNaN(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }
  
  try {
    const result = await db.query(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1 AND m.deleted_at IS NULL
       ORDER BY m.created_at ASC`,
      [roomId]
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat/rooms/:id/messages
router.post('/rooms/:id/messages', async (req, res) => {
  const roomId = parseInt(req.params.id);
  const { content, message_type, code_language, reply_to_id } = req.body;
  
  if (isNaN(roomId) || !content) {
    return res.status(400).json({ error: 'Room ID dan content wajib diisi' });
  }
  
  try {
    const userId = req.user?.id || 1;
    
    const result = await db.query(
      `INSERT INTO messages (room_id, user_id, reply_to_id, content, message_type, code_language, is_pinned, is_edited, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, room_id, content, message_type, code_language, created_at`,
      [roomId, userId, reply_to_id || null, content, message_type || 'text', code_language]
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error('Create message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/chat/messages/:id/pin
router.put('/messages/:id/pin', async (req, res) => {
  const messageId = parseInt(req.params.id);
  
  if (isNaN(messageId)) {
    return res.status(400).json({ error: 'Invalid message ID' });
  }
  
  try {
    const result = await db.query(
      'UPDATE messages SET is_pinned = NOT is_pinned, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING is_pinned',
      [messageId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message tidak ditemukan' });
    }
    
    res.json({ success: true, is_pinned: result.rows[0].is_pinned });
    
  } catch (err) {
    console.error('Pin message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;