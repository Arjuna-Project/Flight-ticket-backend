const mongoose = require('mongoose');

// Per-class pricing and seat availability
const cabinClassSchema = new mongoose.Schema({
  price:          { type: Number, required: true },
  availableSeats: { type: Number, required: true }
}, { _id: false });

const flightInstanceSchema = new mongoose.Schema({
  flight:        { type: mongoose.Schema.Types.ObjectId, ref: 'Flight',   required: true },
  aircraft:      { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
  departureTime: { type: Date,   required: true },
  arrivalTime:   { type: Date,   required: true },
  classes: {
    economy:    { type: cabinClassSchema, required: true },
    premium:    { type: cabinClassSchema, required: true },
    business:   { type: cabinClassSchema, required: true },
    firstClass: { type: cabinClassSchema, required: true }
  },
  status: {
    type:    String,
    enum:    ['Scheduled', 'Delayed', 'Cancelled', 'Completed'],
    default: 'Scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('FlightInstance', flightInstanceSchema);
