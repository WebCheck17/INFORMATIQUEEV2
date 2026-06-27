require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MySQL Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

// JWT Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== AUTH LOGIN ==========
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log("=== LOGIN DEBUG ===");
  console.log("Username:", username);
  console.log("Password:", password ? "****" : "EMPTY");
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    console.log("User found:", rows.length > 0);
    
    if (!rows.length) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }
    
    const user = rows[0];
    
    const valid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", valid);
    
    if (!valid) {
      return res.status(401).json({ error: 'Password salah' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log("✅ Login success:", user.username);
    
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
        role: user.role_id === 1 ? 'Admin' : 'Member',
        photoUrl: user.avatar || '/images/users/default-1.png',
        bgColor: '#' + Math.floor(Math.random()*16777215).toString(16),
        initials: user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
      }
    });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== AUTH REGISTER ==========
app.post('/api/auth/register', async (req, res) => {
  const { username, gender, email, password, name, nim, kelas, jurusan } = req.body;
  
  console.log("=== REGISTER DEBUG ===");
  console.log("Body:", req.body);
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  
  const defaultAvatar = gender === 'female' 
    ? '/images/users/default-2.png' 
    : '/images/users/default-1.png';
  
  try {
    const [exists] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (exists.length) {
      return res.status(400).json({ error: 'Username atau email sudah terdaftar' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      `INSERT INTO users 
        (role_id, username, email, password, name, avatar, nim, kelas, jurusan, bio, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [2, username, email, hashedPassword, name, defaultAvatar, nim || null, kelas || null, jurusan || null, 'Mahasiswa baru di KelasHub! 👋', 1]
    );
    
    console.log("✅ Register success, ID:", result.insertId);
    
    res.status(201).json({ 
      message: 'Registrasi berhasil',
      userId: result.insertId 
    });
    
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// ========== AUTH ME ==========
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== USERS ==========
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.*, r.name as role_name, r.slug as role_slug 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.deleted_at IS NULL
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== POSTS ==========
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published' AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    const [result] = await db.query(
      'INSERT INTO posts (user_id, title, slug, description, category, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [req.user.id, title, slug, description, category, JSON.stringify(tags || []), 'published']
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== DEADLINES ==========
app.get('/api/deadlines', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, u.name as author_name
      FROM deadlines d
      JOIN users u ON d.user_id = u.id
      WHERE d.deleted_at IS NULL
      ORDER BY d.deadline_at ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/deadlines', authMiddleware, async (req, res) => {
  try {
    const { title, description, mata_kuliah, dosen, deadline_at, priority } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    const [result] = await db.query(
      'INSERT INTO deadlines (user_id, title, slug, description, mata_kuliah, dosen, deadline_at, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, slug, description, mata_kuliah, dosen, deadline_at, priority || 'medium', 'published']
    );
    
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== CHAT ROOMS ==========
app.get('/api/chat/rooms', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cr.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM messages WHERE room_id = cr.id) as message_count
      FROM chat_rooms cr
      JOIN users u ON cr.created_by = u.id
      WHERE cr.is_active = 1 AND cr.deleted_at IS NULL
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/chat/rooms/:id/messages', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ? AND m.deleted_at IS NULL
      ORDER BY m.created_at ASC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/chat/rooms/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content, message_type = 'text' } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO messages (room_id, user_id, content, message_type) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, content, message_type]
    );
    
    res.json({ id: result.insertId, room_id: req.params.id, content, created_at: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== SETTINGS ==========
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(s => settings[s.key] = s.value);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export untuk Vercel
module.exports = app;
