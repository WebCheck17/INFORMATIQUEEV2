const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT key, value, type, group_name, description FROM settings'
    );
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        type: row.type,
        group: row.group_name,
        description: row.description
      };
    });
    
    res.json(settings);
    
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/settings/:key
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  
  try {
    const result = await db.query(
      'SELECT key, value, type, group_name, description FROM settings WHERE key = $1',
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting tidak ditemukan' });
    }
    
    const row = result.rows[0];
    res.json({
      key: row.key,
      value: row.value,
      type: row.type,
      group: row.group_name,
      description: row.description
    });
    
  } catch (err) {
    console.error('Get setting error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/:key
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  try {
    await db.query(
      'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
      [value, key]
    );
    
    res.json({ success: true, key, value });
    
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;