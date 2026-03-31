const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { connectDB } = require('./config/db');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection for serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Define Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/flights', require('./src/routes/flight.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: "API working ✅" });
});

app.get('/', (req, res) => res.send('API Running'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Server Error' });
});

module.exports = app;