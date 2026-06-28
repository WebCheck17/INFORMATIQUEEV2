require('dotenv').config();

// ============================================
// GLOBAL ERROR HANDLERS (catch everything)
// ============================================
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

const express = require('express');
const app = express();

// ============================================
// CORS — MUST BE FIRST
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const ALLOWED_ORIGINS = [
    'https://informatiquee.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
  ];

  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || 'https://informatiquee.vercel.app');
  } else {
    res.header('Access-Control-Allow-Origin', 'https://informatiquee.vercel.app');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');

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
// REQUEST LOGGING (for debugging)
// ============================================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ============================================
// HEALTH CHECK (no DB required)
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV || 'development',
      has_jwt_secret: !!process.env.JWT_SECRET,
      has_database_url: !!process.env.DATABASE_URL,
    }
  });
});

// ============================================
// DB TEST ENDPOINT
// ============================================
app.get('/api/db-test', async (req, res) => {
  try {
    const db = require('../db');
    const result = await db.query('SELECT NOW() as now');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      time: result.rows[0].now 
    });
  } catch (err) {
    console.error('DB Test Error:', err.message);
    res.status(500).json({ 
      status: 'ERROR', 
      database: err.message 
    });
  }
});

// ============================================
// ROUTES (with error handling)
// ============================================
try {
  app.use('/api/auth', require('../routes/auth'));
} catch (err) {
  console.error('Failed to load auth routes:', err.message);
  app.use('/api/auth', (req, res) => res.status(500).json({ error: 'Auth module failed to load' }));
}

try {
  app.use('/api/users', require('../routes/users'));
} catch (err) {
  console.error('Failed to load users routes:', err.message);
  app.use('/api/users', (req, res) => res.status(500).json({ error: 'Users module failed to load' }));
}

try {
  app.use('/api/posts', require('../routes/posts'));
} catch (err) {
  console.error('Failed to load posts routes:', err.message);
  app.use('/api/posts', (req, res) => res.status(500).json({ error: 'Posts module failed to load' }));
}

try {
  app.use('/api/deadlines', require('../routes/deadlines'));
} catch (err) {
  console.error('Failed to load deadlines routes:', err.message);
}

try {
  app.use('/api/chat', require('../routes/chat'));
} catch (err) {
  console.error('Failed to load chat routes:', err.message);
}

try {
  app.use('/api/notifications', require('../routes/notifications'));
} catch (err) {
  console.error('Failed to load notifications routes:', err.message);
}

try {
  app.use('/api/settings', require('../routes/settings'));
} catch (err) {
  console.error('Failed to load settings routes:', err.message);
}

try {
  app.use('/api/activity-logs', require('../routes/activity'));
} catch (err) {
  console.error('Failed to load activity routes:', err.message);
}

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
  console.error('Express Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
