const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

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
  const db = getDB();
  const airportsCol = db.collection('airports');
  
  // 1. Resolve airports
  const departureAirport = await airportsCol.findOne({ code: from.toUpperCase() });
  const arrivalAirport   = await airportsCol.findOne({ code: to.toUpperCase() });

  if (!departureAirport || !arrivalAirport) return [];

  // 2. Date range (start-of-day → end-of-day)
  const searchDate = new Date(date);
  const startOfDay = new Date(searchDate); startOfDay.setHours(0,  0,  0,   0);
  const endOfDay   = new Date(searchDate); endOfDay.setHours(23, 59, 59, 999);

  // 3. Resolve cabin class key (default: economy)
  const classKey  = CLASS_MAP[travelClass] || 'economy';
  const seatsPath = `classes.${classKey}.availableSeats`;

  // 4. Query instances with aggregation
  const instancesCol = db.collection('flightinstances');
  
  const pipeline = [
    {
      $match: {
        departureTime: { $gte: startOfDay, $lte: endOfDay },
        [seatsPath]: { $gte: parseInt(passengers, 10) || 1 },
        status: 'Scheduled'
      }
    },
    {
      $lookup: {
        from: 'flights',
        localField: 'flight',
        foreignField: '_id',
        as: 'flightInfo'
      }
    },
    { $unwind: '$flightInfo' },
    {
      $match: {
        'flightInfo.departureAirport': departureAirport._id,
        'flightInfo.arrivalAirport': arrivalAirport._id
      }
    },
    {
      $lookup: {
        from: 'aircrafts',
        localField: 'aircraft',
        foreignField: '_id',
        as: 'aircraftInfo'
      }
    },
    { $unwind: { path: '$aircraftInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airlines',
        localField: 'flightInfo.airline',
        foreignField: '_id',
        as: 'flightInfo.airlineData'
      }
    },
    { $unwind: { path: '$flightInfo.airlineData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightInfo.departureAirport',
        foreignField: '_id',
        as: 'flightInfo.departureAirportData'
      }
    },
    { $unwind: { path: '$flightInfo.departureAirportData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightInfo.arrivalAirport',
        foreignField: '_id',
        as: 'flightInfo.arrivalAirportData'
      }
    },
    { $unwind: { path: '$flightInfo.arrivalAirportData', preserveNullAndEmptyArrays: true } },
    {
      $sort: { departureTime: 1 }
    }
  ];

  const instances = await instancesCol.aggregate(pipeline).toArray();

  return instances.map(inst => {
    inst.flight = {
      ...inst.flightInfo,
      airline: inst.flightInfo.airlineData,
      departureAirport: inst.flightInfo.departureAirportData,
      arrivalAirport: inst.flightInfo.arrivalAirportData
    };
    delete inst.flight.airlineData;
    delete inst.flight.departureAirportData;
    delete inst.flight.arrivalAirportData;
    delete inst.flightInfo;

    inst.aircraft = inst.aircraftInfo;
    delete inst.aircraftInfo;

    const classData = inst.classes?.[classKey] || {};

    // Keep full classes object for future use
    inst.selectedClass     = classKey;
    inst.selectedClassData = classData;

    // Backward-compatible top-level fields
    inst.price          = classData.price          ?? 0;
    inst.availableSeats = classData.availableSeats ?? 0;

    return inst;
  });
};

const getFlightInstanceById = async (id) => {
  const db = getDB();
  const instancesCol = db.collection('flightinstances');

  const pipeline = [
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: 'flights',
        localField: 'flight',
        foreignField: '_id',
        as: 'flightInfo'
      }
    },
    { $unwind: { path: '$flightInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'aircrafts',
        localField: 'aircraft',
        foreignField: '_id',
        as: 'aircraftInfo'
      }
    },
    { $unwind: { path: '$aircraftInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airlines',
        localField: 'flightInfo.airline',
        foreignField: '_id',
        as: 'flightInfo.airlineData'
      }
    },
    { $unwind: { path: '$flightInfo.airlineData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightInfo.departureAirport',
        foreignField: '_id',
        as: 'flightInfo.departureAirportData'
      }
    },
    { $unwind: { path: '$flightInfo.departureAirportData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightInfo.arrivalAirport',
        foreignField: '_id',
        as: 'flightInfo.arrivalAirportData'
      }
    },
    { $unwind: { path: '$flightInfo.arrivalAirportData', preserveNullAndEmptyArrays: true } }
  ];

  const results = await instancesCol.aggregate(pipeline).toArray();
  const inst = results[0];

  if (!inst) {
    const err = new Error('Flight not found');
    err.statusCode = 404;
    throw err;
  }

  if (inst.flightInfo) {
    inst.flight = {
      ...inst.flightInfo,
      airline: inst.flightInfo.airlineData,
      departureAirport: inst.flightInfo.departureAirportData,
      arrivalAirport: inst.flightInfo.arrivalAirportData
    };
    delete inst.flight.airlineData;
    delete inst.flight.departureAirportData;
    delete inst.flight.arrivalAirportData;
  }
  delete inst.flightInfo;

  inst.aircraft = inst.aircraftInfo;
  delete inst.aircraftInfo;

  const econData = inst.classes?.economy || {};
  inst.price          = econData.price          ?? 0;
  inst.availableSeats = econData.availableSeats ?? 0;

  return inst;
};

module.exports = { searchFlights, getFlightInstanceById };

