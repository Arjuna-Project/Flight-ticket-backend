const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightInstance: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightInstance', required: true },
  bookingReference: { type: String, required: true, unique: true },
  passengers: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    seatNumber: { type: String, required: true }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
