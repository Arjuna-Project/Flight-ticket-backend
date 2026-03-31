const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');
const generateBookingRef = require('../utils/generateBookingRef');

const createBooking = async (bookingData) => {
  const { user, flightInstance: instanceId, passengers, totalPrice } = bookingData;
  const db = getDB();
  const instancesCol = db.collection('flightinstances');
  const bookingsCol = db.collection('bookings');

  // 1. Verify FlightInstance
  const instance = await instancesCol.findOne({ _id: new ObjectId(instanceId) });
  if (!instance) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Check available seats (Handling both structured classes and top-level fields)
  // Default to checking economy seats if structure exists, else top level
  let currentSeats = 0;
  if (instance.classes && instance.classes.economy) {
    currentSeats = instance.classes.economy.availableSeats;
  } else if (instance.availableSeats !== undefined) {
    currentSeats = instance.availableSeats;
  }

  if (currentSeats < passengers.length) {
    const err = new Error('Not enough seats available');
    err.statusCode = 400;
    throw err;
  }

  // 3. Create booking
  const bookingReference = generateBookingRef();
  const newBooking = {
    user: new ObjectId(user),
    flightInstance: new ObjectId(instanceId),
    bookingReference,
    passengers,
    totalPrice,
    status: 'Confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await bookingsCol.insertOne(newBooking);
  newBooking._id = result.insertedId;

  // 4. Update available seats on FlightInstance
  const updateQuery = {};
  if (instance.classes && instance.classes.economy) {
    updateQuery['classes.economy.availableSeats'] = -passengers.length;
  }
  if (instance.availableSeats !== undefined) {
    updateQuery['availableSeats'] = -passengers.length;
  }
  
  if (Object.keys(updateQuery).length > 0) {
    await instancesCol.updateOne(
      { _id: new ObjectId(instanceId) },
      { $inc: updateQuery }
    );
  }

  return newBooking;
};

const _buildPopulatePipeline = (matchStage) => {
  return [
    matchStage,
    {
      $lookup: {
        from: 'flightinstances',
        localField: 'flightInstance',
        foreignField: '_id',
        as: 'flightInstanceData'
      }
    },
    { $unwind: { path: '$flightInstanceData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'flights',
        localField: 'flightInstanceData.flight',
        foreignField: '_id',
        as: 'flightData'
      }
    },
    { $unwind: { path: '$flightData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airlines',
        localField: 'flightData.airline',
        foreignField: '_id',
        as: 'flightData.airlineData'
      }
    },
    { $unwind: { path: '$flightData.airlineData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightData.departureAirport',
        foreignField: '_id',
        as: 'flightData.departureAirportData'
      }
    },
    { $unwind: { path: '$flightData.departureAirportData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'airports',
        localField: 'flightData.arrivalAirport',
        foreignField: '_id',
        as: 'flightData.arrivalAirportData'
      }
    },
    { $unwind: { path: '$flightData.arrivalAirportData', preserveNullAndEmptyArrays: true } }
  ];
};

const _mapBookingResult = (b) => {
  if (b.flightData) {
    b.flightData.airline = b.flightData.airlineData;
    b.flightData.departureAirport = b.flightData.departureAirportData;
    b.flightData.arrivalAirport = b.flightData.arrivalAirportData;
    delete b.flightData.airlineData;
    delete b.flightData.departureAirportData;
    delete b.flightData.arrivalAirportData;
    
    if (b.flightInstanceData) {
      b.flightInstanceData.flight = b.flightData;
    }
  }
  
  if (b.flightInstanceData) {
    b.flightInstance = b.flightInstanceData;
    delete b.flightInstanceData;
  }
  
  delete b.flightData;
  return b;
};

const getUserBookings = async (userId) => {
  const db = getDB();
  const bookingsCol = db.collection('bookings');

  const pipeline = _buildPopulatePipeline({ $match: { user: new ObjectId(userId) } });
  pipeline.push({ $sort: { createdAt: -1 } });

  const results = await bookingsCol.aggregate(pipeline).toArray();
  return results.map(_mapBookingResult);
};

const getBookingById = async (bookingId, userId) => {
  const db = getDB();
  const bookingsCol = db.collection('bookings');

  const pipeline = _buildPopulatePipeline({ 
    $match: { 
      _id: new ObjectId(bookingId), 
      user: new ObjectId(userId) 
    } 
  });

  const results = await bookingsCol.aggregate(pipeline).toArray();
  const booking = results[0];
    
  if (!booking) {
    const err = new Error('Booking not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  
  return _mapBookingResult(booking);
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById
};
