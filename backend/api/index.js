require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Health check
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

// Routes
app.use('/api/auth', require('../routes/auth'));      // ← login, register, me
app.use('/api/users', require('../routes/users'));
app.use('/api/posts', require('../routes/posts'));
app.use('/api/deadlines', require('../routes/deadlines'));
app.use('/api/chat', require('../routes/chat'));
app.use('/api/notifications', require('../routes/notifications'));
app.use('/api/settings', require('../routes/settings'));
app.use('/api/activity-logs', require('../routes/activity'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    method: req.method, 
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ 
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
