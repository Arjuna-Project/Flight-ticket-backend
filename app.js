const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');

// Register Models
require('./src/models/Airline.model');
require('./src/models/Airport.model');
require('./src/models/Aircraft.model');
require('./src/models/User.model');
require('./src/models/Flight.model');
require('./src/models/FlightInstance.model');
require('./src/models/Booking.model');

// Connect Database
db();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/flights', require('./src/routes/flight.routes'));
app.use('/api/bookings', require('./src/routes/booking.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

app.get('/', (req, res) => res.send('API Running'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Server Error' });
});

module.exports = app;
