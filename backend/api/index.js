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

// Handle OPTIONS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.use(express.json());

// URL bridge.php di InfinityFree
const BRIDGE_URL = process.env.BRIDGE_URL || 'https://takwa-tracer.page.gd/bridge.php';

// Helper fetch ke bridge
async function bridgeFetch(method, path, body = null) {
  const url = `${BRIDGE_URL}?path=${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bridge error ${res.status}: ${text}`);
    }
    return res.json();
  } catch (err) {
    console.error('Bridge fetch error:', err);
    throw err;
  }
}

// ========== AUTH ==========
app.post('/api/auth/login', async (req, res) => {
  try {
    const data = await bridgeFetch('POST', 'auth/login', req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const data = await bridgeFetch('POST', 'auth/register', req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'auth/me');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== USERS ==========
app.get('/api/users', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'users');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== POSTS ==========
app.get('/api/posts', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'posts');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const data = await bridgeFetch('POST', 'posts', req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DEADLINES ==========
app.get('/api/deadlines', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'deadlines');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deadlines', async (req, res) => {
  try {
    const data = await bridgeFetch('POST', 'deadlines', req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CHAT ==========
app.get('/api/chat/rooms', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'chat/rooms');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/rooms/:id/messages', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', `chat/messages&room_id=${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/rooms/:id/messages', async (req, res) => {
  try {
    const data = await bridgeFetch('POST', `chat/messages&room_id=${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'notifications');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const data = await bridgeFetch('PUT', `notifications/read&id=${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SETTINGS ==========
app.get('/api/settings', async (req, res) => {
  try {
    const data = await bridgeFetch('GET', 'settings');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== HEALTH ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', bridge: BRIDGE_URL });
});

// ========== EXPORT UNTUK VERCEL ==========
// Cara 1: Langsung export app (coba dulu ini)
// module.exports = app;

// Cara 2: Kalau cara 1 gagal, pakai ini:
const server = app;
module.exports = (req, res) => {
  return server(req, res);
};
