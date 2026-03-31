const bookingService = require('../services/booking.service');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const createBooking = async (request, response) => {
  try {
    const bookingData = {
      ...request.body,
      user: request.user.id
    };
    const newBooking = await bookingService.createBooking(bookingData);
    if (!newBooking) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed to create booking"
      });
    } else {
      return response.status(StatusCodes.CREATED).json(newBooking);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const getUserBookings = async (request, response) => {
  const userId = request.user.id;
  try {
    const bookings = await bookingService.getUserBookings(userId);
    if (bookings.length == 0) {
      return response.status(StatusCodes.OK).json([]);
    } else {
      return response.status(StatusCodes.OK).json(bookings);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const getBookingById = async (request, response) => {
  const { id } = request.params;
  const userId = request.user.id;
  try {
    const booking = await bookingService.getBookingById(id, userId);
    if (!booking) {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: `Booking not found for id - ${id}`
      });
    } else {
      return response.status(StatusCodes.OK).json(booking);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById
};
