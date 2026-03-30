const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  durationMinutes: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
