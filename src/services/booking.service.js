const Booking = require('../models/Booking.model');
const FlightInstance = require('../models/FlightInstance.model');
const generateBookingRef = require('../utils/generateBookingRef');

const createBooking = async (bookingData) => {
  const { user, flightInstance: instanceId, passengers, totalPrice } = bookingData;

  // 1. Verify FlightInstance
  const instance = await FlightInstance.findById(instanceId);
  if (!instance) {
    const err = new Error('Flight instance not found');
    err.statusCode = 404;
    throw err;
  }

  // 2. Check available seats
  if (instance.availableSeats < passengers.length) {
    const err = new Error('Not enough seats available');
    err.statusCode = 400;
    throw err;
  }

  // 3. Create booking
  const bookingReference = generateBookingRef();
  const booking = await Booking.create({
    user,
    flightInstance: instanceId,
    bookingReference,
    passengers,
    totalPrice
  });

  // 4. Update available seats on FlightInstance
  instance.availableSeats -= passengers.length;
  await instance.save();

  return booking;
};

const getUserBookings = async (userId) => {
  return await Booking.find({ user: userId })
    .populate({
      path: 'flightInstance',
      populate: {
        path: 'flight',
        populate: ['departureAirport', 'arrivalAirport', 'airline']
      }
    })
    .sort({ createdAt: -1 });
};

const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId })
    .populate({
      path: 'flightInstance',
      populate: {
        path: 'flight',
        populate: ['departureAirport', 'arrivalAirport', 'airline']
      }
    });
    
  if (!booking) {
    const err = new Error('Booking not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return booking;
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById
};
