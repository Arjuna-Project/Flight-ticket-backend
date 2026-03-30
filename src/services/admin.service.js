const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const FlightInstance = require('../models/FlightInstance.model');
const Flight = require('../models/Flight.model');
const Aircraft = require('../models/Aircraft.model');
const Airline = require('../models/Airline.model');
const Airport = require('../models/Airport.model');

const getDashboardStats = async () => {
  const [totalUsers, totalBookings, totalFlights, revenueResult] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments(),
    FlightInstance.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  return { totalUsers, totalBookings, totalFlights, totalRevenue };
};

const getAllUsers = async () => {
  return await User.find({}).select('-password').sort({ createdAt: -1 });
};

const getAllBookings = async () => {
  return await Booking.find({})
    .populate('user', 'name email')
    .populate({
      path: 'flightInstance',
      populate: {
        path: 'flight',
        populate: ['departureAirport', 'arrivalAirport', 'airline']
      }
    })
    .sort({ createdAt: -1 });
};

const getAllFlightInstances = async () => {
  return await FlightInstance.find({})
    .populate({
      path: 'flight',
      populate: ['departureAirport', 'arrivalAirport', 'airline']
    })
    .populate('aircraft')
    .sort({ departureTime: -1 });
};

const updateFlightStatus = async (instanceId, status) => {
  const validStatuses = ['Scheduled', 'Delayed', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    const err = new Error('Invalid status value');
    err.statusCode = 400;
    throw err;
  }
  const instance = await FlightInstance.findByIdAndUpdate(
    instanceId, { status }, { new: true }
  );
  if (!instance) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }
  return instance;
};

const deleteFlightInstance = async (instanceId) => {
  const instance = await FlightInstance.findByIdAndDelete(instanceId);
  if (!instance) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Flight deleted successfully' };
};

const cancelBooking = async (bookingId) => {
  const booking = await Booking.findByIdAndUpdate(
    bookingId, { status: 'Cancelled' }, { new: true }
  );
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  return booking;
};

const getRecentBookings = async (limit = 10) => {
  return await Booking.find({})
    .populate('user', 'name email')
    .populate({
      path: 'flightInstance',
      populate: {
        path: 'flight',
        populate: ['departureAirport', 'arrivalAirport']
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = {
  getDashboardStats, getAllUsers, getAllBookings, getAllFlightInstances,
  updateFlightStatus, deleteFlightInstance, cancelBooking, getRecentBookings
};
