const FlightInstance = require('../models/FlightInstance.model');
const Airport = require('../models/Airport.model');

// Map frontend class labels → DB field names
const CLASS_MAP = {
  'Economy':    'economy',
  'Premium':    'premium',
  'Business':   'business',
  'First Class':'firstClass',
  'economy':    'economy',
  'premium':    'premium',
  'business':   'business',
  'firstClass': 'firstClass',
  'first':      'firstClass'
};

const searchFlights = async ({ from, to, date, passengers, travelClass }) => {
  // 1. Resolve airports
  const departureAirport = await Airport.findOne({ code: from.toUpperCase() });
  const arrivalAirport   = await Airport.findOne({ code: to.toUpperCase() });

  if (!departureAirport || !arrivalAirport) return [];

  // 2. Date range (start-of-day → end-of-day)
  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate); startOfDay.setHours(0,  0,  0,   0);
  const endOfDay   = new Date(searchDate); endOfDay.setHours(23, 59, 59, 999);

  // 3. Resolve cabin class key (default: economy)
  const classKey  = CLASS_MAP[travelClass] || 'economy';
  const seatsPath = `classes.${classKey}.availableSeats`;

  // 4. Query instances with enough seats in the selected class
  const instances = await FlightInstance.find({
    departureTime: { $gte: startOfDay, $lte: endOfDay },
    [seatsPath]:   { $gte: parseInt(passengers, 10) || 1 },
    status:        'Scheduled'
  })
  .populate({
    path: 'flight',
    match: {
      departureAirport: departureAirport._id,
      arrivalAirport:   arrivalAirport._id
    },
    populate: [
      { path: 'airline' },
      { path: 'departureAirport' },
      { path: 'arrivalAirport' }
    ]
  })
  .populate('aircraft')
  .sort({ departureTime: 1 });

  // 5. Filter out non-matching routes; attach selected class info to each result
  return instances
    .filter(inst => inst.flight !== null)
    .map(inst => {
      const obj = inst.toObject();
      const classData = obj.classes?.[classKey] || {};

      // Keep full classes object for future use
      obj.selectedClass     = classKey;
      obj.selectedClassData = classData;

      // ⬇ Backward-compatible top-level fields the frontend already reads
      obj.price          = classData.price          ?? 0;
      obj.availableSeats = classData.availableSeats ?? 0;

      return obj;
    });
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

  // Attach backward-compatible top-level price (default to economy)
  const obj = flight.toObject();
  const econData = obj.classes?.economy || {};
  obj.price          = econData.price          ?? 0;
  obj.availableSeats = econData.availableSeats ?? 0;
  return obj;
};

module.exports = { searchFlights, getFlightInstanceById };

