const mongoose = require('mongoose');

const flightInstanceSchema = new mongoose.Schema({
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  aircraft: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  status: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('FlightInstance', flightInstanceSchema);
