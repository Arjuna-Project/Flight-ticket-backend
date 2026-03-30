const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/flight-booking',
  JWT_SECRET: process.env.JWT_SECRET || 'secretkey1234567890',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};
