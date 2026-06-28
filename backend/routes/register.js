const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// JWT Secret (pake env variable di production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = result.rows[0];

    // Cek password (kalo pake bcrypt)
    const isValid = await bcrypt.compare(password, user.password);
    
    // Kalo password plain text (development only):
    // const isValid = password === user.password;

    if (!isValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
        role: user.role_name || user.role,
        roleSlug: user.role_slug,
        photoUrl: user.avatar || user.photo_url,
        bgColor: user.bg_color,
        initials: user.initials,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register ← TAMBAH INI
router.post('/register', async (req, res) => {
  const {
    name,
    username,
    email,
    gender,
    nim,
    password,
    kelas,
    jurusan
  } = req.body;

  // Validasi
  if (!name || !username || !email || !nim || !password) {
    return res.status(400).json({ 
      error: 'Nama, username, email, NIM, dan password wajib diisi' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    // Cek username sudah ada
    const checkUser = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await db.query(
      `INSERT INTO users (
        name, username, email, password, gender, nim, 
        kelas, jurusan, bio, role_id, is_active, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, 1, true, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id, name, username, email, nim, kelas, jurusan, bio`,
      [
        name.trim(),
        username.trim().toLowerCase(),
        email.trim().toLowerCase(),
        hashedPassword,
        gender || 'male',
        nim.trim(),
        kelas || '15.5A.02',
        jurusan || 'Teknik Informatika',
        'Mahasiswa baru bergabung di KelasHub! 👋'
      ]
    );

    const newUser = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        nim: newUser.nim,
        kelas: newUser.kelas,
        jurusan: newUser.jurusan,
        bio: newUser.bio,
        role: 'Member',
        roleSlug: 'member',
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me ← TAMBAH INI JUGA (untuk cek user yang login)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const result = await db.query(
      `SELECT u.id, u.name, u.username, u.email, u.nim, 
              u.kelas, u.jurusan, u.bio, u.avatar, u.gender,
              r.name as role_name, r.slug as role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ user: result.rows[0] });

  } catch (err) {
    console.error('Auth me error:', err);
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;
