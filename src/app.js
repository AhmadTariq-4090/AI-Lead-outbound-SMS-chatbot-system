require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const smsRoutes = require('./routes/smsRoutes');
const logger = require('./utils/logger');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Required for Twilio webhook (form-encoded body)

// Request logger
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', smsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallthrough
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
});

// ── Database Connection ──────────────────────────────────────────────────────
async function connectDb() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('MongoDB connected');
}

module.exports = { app, connectDb };
