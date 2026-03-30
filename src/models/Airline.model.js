const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  logoUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Airline', airlineSchema);
