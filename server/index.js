require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Mini Star Childcare API' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/children', require('./routes/children'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/seed', require('./routes/seed'));

// 404 for unknown API routes
app.use('/api/*', (req, res) => res.status(404).json({ error: 'API route not found' }));

// Serve React Native Web (Expo) frontend
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));
app.get('*', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mini Star API running on port ${PORT}`);
  console.log(`DB: ${process.env.DATABASE_URL ? 'Connected' : 'NOT configured'}`);
});
