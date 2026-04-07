const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');

const getDashboardStats = async () => {
  const db = getDB();
  const [totalUsers, totalBookings, totalFlights, revenueResult] = await Promise.all([
    db.collection('users').countDocuments({ role: 'user' }),
    db.collection('bookings').countDocuments(),
    db.collection('flightinstances').countDocuments(),
    db.collection('bookings').aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]).toArray()
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  return { totalUsers, totalBookings, totalFlights, totalRevenue };
};

const getAllUsers = async () => {
  const db = getDB();
  return await db.collection('users')
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
};

const _buildBookingPipeline = (matchStage = null, limit = null) => {
  const pipeline = [];
  if (matchStage) pipeline.push(matchStage);

  pipeline.push({ $sort: { createdAt: -1 } });
  if (limit) pipeline.push({ $limit: limit });

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
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
  );

  return pipeline;
};

const _mapBookingResult = (b) => {
  if (b.userData) {
    b.user = { _id: b.userData._id, name: b.userData.name, email: b.userData.email };
    delete b.userData;
  }

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

const getAllBookings = async () => {
  const db = getDB();
  const pipeline = _buildBookingPipeline();
  const results = await db.collection('bookings').aggregate(pipeline).toArray();
  return results.map(_mapBookingResult);
};

const getAllFlightInstances = async () => {
  const db = getDB();
  const pipeline = [
    { $sort: { departureTime: -1 } },
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

  const results = await db.collection('flightinstances').aggregate(pipeline).toArray();

  return results.map(inst => {
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

    return inst;
  });
};

const updateFlightStatus = async (instanceId, status) => {
  const validStatuses = ['Scheduled', 'Delayed', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    const err = new Error('Invalid status value');
    err.statusCode = 400;
    throw err;
  }

  const db = getDB();
  const result = await db.collection('flightinstances').findOneAndUpdate(
    { _id: new ObjectId(instanceId) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }
  return result;
};

const deleteFlightInstance = async (instanceId) => {
  const db = getDB();
  const result = await db.collection('flightinstances').findOneAndDelete({ _id: new ObjectId(instanceId) });

  if (!result) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Flight deleted successfully' };
};

const cancelBooking = async (bookingId) => {
  const db = getDB();
  const result = await db.collection('bookings').findOneAndUpdate(
    { _id: new ObjectId(bookingId) },
    { $set: { status: 'Cancelled', updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!result) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return result;
};

const getRecentBookings = async (limit = 10) => {
  const db = getDB();
  const pipeline = _buildBookingPipeline(null, limit);
  const results = await db.collection('bookings').aggregate(pipeline).toArray();
  return results.map(_mapBookingResult);
};

module.exports = {
  getDashboardStats, getAllUsers, getAllBookings, getAllFlightInstances,
  updateFlightStatus, deleteFlightInstance, cancelBooking, getRecentBookings
};
