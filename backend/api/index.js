require('dotenv').config();
const express = require('express');

const app = express();

// ============================================
// CORS — ULTIMATE CONFIG FOR VERCEL
// ============================================
// Vercel sometimes strips CORS headers from Express middleware.
// Solution: Set headers manually BEFORE everything else.

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ALLOWED_ORIGINS = [
    'https://informatiquee.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
  ];

  // Set CORS headers for ALL responses (including errors)
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || 'https://informatiquee.vercel.app');
  } else {
    res.header('Access-Control-Allow-Origin', 'https://informatiquee.vercel.app');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    const db = require('../db');
    const result = await db.query('SELECT NOW() as now');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      time: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: err.message 
    });
  }
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/posts', require('../routes/posts'));
app.use('/api/deadlines', require('../routes/deadlines'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/notifications', require('../routes/notifications'));
app.use('/api/settings', require('../routes/settings'));
app.use('/api/activity-logs', require('../routes/activity'));

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    method: req.method, 
    path: req.path 
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ 
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
