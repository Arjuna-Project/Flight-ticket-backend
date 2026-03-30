const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  model: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  seatLayout: { type: String, default: '3-3' } // E.g., '3-3' for small, '3-4-3' for widebody
}, { timestamps: true });

module.exports = mongoose.model('Aircraft', aircraftSchema);
