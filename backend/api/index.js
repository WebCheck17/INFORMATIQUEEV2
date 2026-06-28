require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ============================================
// CORS — ROBUST CONFIGURATION
// ============================================
// Daftar origin yang diizinkan
const ALLOWED_ORIGINS = [
  'https://informatiquee.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
];

// CORS middleware dengan origin validation
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Explicitly handle OPTIONS (preflight) for all routes
app.options('*', cors());

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

  // CORS error handling
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }

  res.status(500).json({ 
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
