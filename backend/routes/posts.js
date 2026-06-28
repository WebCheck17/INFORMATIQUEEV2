const express = require('express');
const router = express.Router();
const db = require('../db');

// ============================================
// GET /api/posts — List all posts
// ============================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published' AND p.deleted_at IS NULL
      ORDER BY p.is_pinned DESC, p.created_at DESC`
    );

    // Kirim path relatif, frontend resolve pakai getImageUrl()
    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url || 'default-1.png',
      video_url: row.video_url,
      category: row.category,
      tags: row.tags,
      view_count: row.view_count,
      is_pinned: row.is_pinned,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_name: row.author_name,
      author_avatar: row.author_avatar || 'default-1.png',
      likes_count: parseInt(row.likes_count) || 0,
      comments_count: parseInt(row.comments_count) || 0,
    }));

    res.json(posts);

  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// GET /api/posts/:slug — Single post detail
// ============================================
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // Increment view count
    await db.query('UPDATE posts SET view_count = view_count + 1 WHERE slug = $1', [slug]);

    const result = await db.query(
      `SELECT p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.slug = $1 AND p.status = 'published' AND p.deleted_at IS NULL`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];
    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      image_url: post.image_url || 'default-1.png',
      video_url: post.video_url,
      category: post.category,
      tags: post.tags,
      view_count: post.view_count,
      is_pinned: post.is_pinned,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author_name: post.author_name,
      author_avatar: post.author_avatar || 'default-1.png',
      likes_count: parseInt(post.likes_count) || 0,
      comments_count: parseInt(post.comments_count) || 0,
    });

  } catch (err) {
    console.error('Get post by slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/posts — Create new post
// ============================================
router.post('/', async (req, res) => {
  const { title, description, category, tags, video_url, image_url } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title wajib diisi' });
  }

  try {
    const userId = req.user?.id || 1;

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Make slug unique
    const slugCheck = await db.query('SELECT id FROM posts WHERE slug = $1', [slug]);
    const finalSlug = slugCheck.rows.length > 0 ? `${slug}-${Date.now()}` : slug;

    const result = await db.query(
      `INSERT INTO posts (user_id, title, slug, description, category, tags, video_url, image_url, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, title, slug`,
      [userId, title, description, category, JSON.stringify(tags || []), video_url, image_url || 'default-1.png']
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/posts/:id/like — Toggle like
// ============================================
router.post('/:id/like', async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user?.id || 1;

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  try {
    // Check if already liked
    const check = await db.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (check.rows.length > 0) {
      // Unlike
      await db.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      res.json({ liked: false });
    } else {
      // Like
      await db.query(
        'INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [postId, userId]
      );
      res.json({ liked: true });
    }

  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// GET /api/posts/:id/comments — Get comments
// ============================================
router.get('/:id/comments', async (req, res) => {
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  try {
    const result = await db.query(
      `SELECT c.*, u.name as author_name, u.avatar as author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at DESC`,
      [postId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST /api/posts/upload — Upload image (GitHub)
// ============================================
router.post('/upload', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName wajib diisi' });
    }

    // Return URL GitHub raw — frontend/images/ folder
    const githubRawUrl = `https://raw.githubusercontent.com/WebCheck17/INFORMATIQUEEV2/main/frontend/images/${fileName}`;

    res.json({
      url: githubRawUrl,
      path: fileName, // path relatif untuk disimpan di DB
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
