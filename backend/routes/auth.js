const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }
  
  try {
    const result = await db.query(
      `SELECT u.*, r.name as role_name, r.slug as role_slug 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = $1 AND u.deleted_at IS NULL`,
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }
    
    const user = result.rows[0];
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Password salah' });
    }
    
    // Update last_login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
// routes/auth.js
res.json({
  token,
  user: {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    nim: user.nim,
    kelas: user.kelas,
    jurusan: user.jurusan,
    bio: user.bio,
    role: user.role?.toLowerCase() || 'member',  // lowercase!
    avatar: user.avatar?.startsWith('/') ? user.avatar : `/images/${user.avatar}`,
    photoUrl: user.avatar?.startsWith('/') ? user.avatar : `/images/${user.avatar}`,
    gender: user.gender,
    bgColor: user.bg_color || '#' + Math.floor(Math.random()*16777215).toString(16),
    initials: user.initials || user.name?.split(" ").map((n) => n[0]).join("").substring(0,2).toUpperCase(),
  }
});
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, name, gender, nim, kelas, jurusan } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  
  try {
    // Cek username/email exists
    const check = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2 AND deleted_at IS NULL',
      [username, email]
    );
    
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Username atau email sudah terdaftar' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatar = gender === 'female' ? '/images/default-2.png' : '/images/default-1.png';
    const bio = 'Mahasiswa baru di KelasHub! 👋';
    
    const result = await db.query(
      `INSERT INTO users (role_id, username, email, password, name, avatar, nim, kelas, jurusan, bio, gender, is_active, created_at, updated_at)
       VALUES (2, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [username, email, hashedPassword, name, avatar, nim, kelas, jurusan, bio, gender || 'male']
    );
    
    res.status(201).json({
      message: 'Registrasi berhasil',
      userId: result.rows[0].id
    });
    
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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
    
    const user = result.rows[0];
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        nim: user.nim,
        kelas: user.kelas,
        jurusan: user.jurusan,
        bio: user.bio,
        role: user.role_name,
        photoUrl: user.avatar || '/images/default-1.png',
        bgColor: '#' + require('crypto').createHash('md5').update(user.name).digest('hex').substring(0, 6),
        initials: user.name.substring(0, 2).toUpperCase()
      }
    });
    
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    console.error('Auth me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
