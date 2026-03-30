const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');

const app = express();

// ✅ Connect DB inside handler (important for serverless)
let isConnected = false;

async function connectDatabase() {
  if (!isConnected) {
    await db();
    isConnected = true;
    console.log("DB Connected");
  }
}

// Init Middleware
app.use(cors());
app.use(express.json());

// Register Models (keep as is)
require('./src/models/Airline.model');
require('./src/models/Airport.model');
require('./src/models/Aircraft.model');
require('./src/models/User.model');
require('./src/models/Flight.model');
require('./src/models/FlightInstance.model');
require('./src/models/Booking.model');

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDatabase();
  next();
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