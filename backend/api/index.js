require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// ============================================
// CORS - MUST BE FIRST
// ============================================
app.use(cors({
  origin: [
    'https://informatiquee.vercel.app',
    'https://informatiquee-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle OPTIONS preflight
app.options('*', cors());

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING
// ============================================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | Origin: ${req.headers.origin || 'none'}`);
  next();
});

// ============================================
// HEALTH CHECK (no DB required)
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Vercel backend is running!',
    timestamp: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV || 'development',
      has_jwt_secret: !!process.env.JWT_SECRET,
      has_database_url: !!process.env.DATABASE_URL,
    }
  });
});

// ============================================
// DB TEST
// ============================================
app.get('/api/db-test', async (req, res) => {
  try {
    const db = require('./db');
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
      error: err.message 
    });
  }
});

// ============================================
// ROUTES
// ============================================
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Auth routes failed:', err.message);
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ Users routes loaded');
} catch (err) {
  console.error('❌ Users routes failed:', err.message);
}

try {
  app.use('/api/posts', require('./routes/posts'));
  console.log('✅ Posts routes loaded');
} catch (err) {
  console.error('❌ Posts routes failed:', err.message);
}

try {
  app.use('/api/deadlines', require('./routes/deadlines'));
  console.log('✅ Deadlines routes loaded');
} catch (err) {
  console.error('❌ Deadlines routes failed:', err.message);
}

try {
  app.use('/api/chat', require('./routes/chat'));
  console.log('✅ Chat routes loaded');
} catch (err) {
  console.error('❌ Chat routes failed:', err.message);
}

try {
  app.use('/api/notifications', require('./routes/notifications'));
  console.log('✅ Notifications routes loaded');
} catch (err) {
  console.error('❌ Notifications routes failed:', err.message);
}

try {
  app.use('/api/settings', require('./routes/settings'));
  console.log('✅ Settings routes loaded');
} catch (err) {
  console.error('❌ Settings routes failed:', err.message);
}

try {
  app.use('/api/activity-logs', require('./routes/activity'));
  console.log('✅ Activity routes loaded');
} catch (err) {
  console.error('❌ Activity routes failed:', err.message);
}

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Express Error:', err.message);
  res.status(500).json({ 
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
