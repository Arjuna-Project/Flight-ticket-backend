const bookingService = require('../services/booking.service');

const createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    const newBooking = await bookingService.createBooking(bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById
};
