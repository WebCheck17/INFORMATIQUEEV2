const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/deadlines
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, u.name as author_name
       FROM deadlines d
       JOIN users u ON d.user_id = u.id
       WHERE d.deleted_at IS NULL
       ORDER BY d.deadline_at ASC`
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Get deadlines error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/deadlines/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  
  try {
    const result = await db.query(
      `SELECT d.*, u.name as author_name
       FROM deadlines d
       JOIN users u ON d.user_id = u.id
       WHERE d.slug = $1 AND d.deleted_at IS NULL`,
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deadline tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('Get deadline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/deadlines
router.post('/', async (req, res) => {
  const { title, description, mata_kuliah, dosen, deadline_at, notes, priority } = req.body;
  
  if (!title || !mata_kuliah || !deadline_at) {
    return res.status(400).json({ error: 'Title, mata_kuliah, dan deadline_at wajib diisi' });
  }
  
  try {
    const userId = req.user?.id || 1;
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    
    const slugCheck = await db.query('SELECT id FROM deadlines WHERE slug = $1', [slug]);
    const finalSlug = slugCheck.rows.length > 0 ? `${slug}-${Date.now()}` : slug;
    
    const result = await db.query(
      `INSERT INTO deadlines (user_id, title, slug, description, mata_kuliah, dosen, deadline_at, notes, priority, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, title, slug`,
      [userId, title, finalSlug, description, mata_kuliah, dosen, deadline_at, notes, priority || 'medium']
    );
    
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error('Create deadline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/deadlines/:id/status
router.put('/:id/status', async (req, res) => {
  const deadlineId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (isNaN(deadlineId) || !status) {
    return res.status(400).json({ error: 'Invalid deadline ID or status' });
  }
  
  const validStatuses = ['draft', 'published', 'completed', 'archived'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    await db.query(
      'UPDATE deadlines SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, deadlineId]
    );
    
    res.json({ success: true, status });
    
  } catch (err) {
    console.error('Update deadline status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;