const FlightInstance = require('../models/FlightInstance.model');
const Airport = require('../models/Airport.model');

const searchFlights = async ({ from, to, date, passengers, travelClass }) => {
  // 1. Find airports by code
  const departureAirport = await Airport.findOne({ code: from });
  const arrivalAirport = await Airport.findOne({ code: to });

  if (!departureAirport || !arrivalAirport) {
    return []; // Invalid route
  }

  // 2. Parse date for start and end of that day
  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

  // 3. Search FlightInstances
  const flights = await FlightInstance.find({
    departureTime: { $gte: startOfDay, $lte: endOfDay },
    availableSeats: { $gte: passengers },
    status: 'Scheduled'
  })
  .populate({
    path: 'flight',
    match: { 
      departureAirport: departureAirport._id, 
      arrivalAirport: arrivalAirport._id 
    },
    populate: [
      { path: 'airline' },
      { path: 'departureAirport' },
      { path: 'arrivalAirport' }
    ]
  })
  .populate('aircraft');

  // Filter out instances where the flight didn't match
  return flights.filter(inst => inst.flight !== null);
};

const getFlightInstanceById = async (id) => {
  const flight = await FlightInstance.findById(id)
    .populate({
      path: 'flight',
      populate: [
        { path: 'airline' },
        { path: 'departureAirport' },
        { path: 'arrivalAirport' }
      ]
    })
    .populate('aircraft');

  if (!flight) {
    const err = new Error('Flight not found');
    err.statusCode = 404;
    throw err;
  }
  return flight;
};

module.exports = {
  searchFlights,
  getFlightInstanceById
};
