const adminService = require('../services/admin.service');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const getDashboardStats = async (request, response) => {
  try {
    const stats = await adminService.getDashboardStats();
    const recentBookings = await adminService.getRecentBookings(10);
    
    if (!stats) {
      return response.status(StatusCodes.BAD_REQUEST).json({ message: "Failed to fetch dashboard stats" });
    } else {
      return response.status(StatusCodes.OK).json({ stats, recentBookings });
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const getAllUsers = async (request, response) => {
  try {
    const users = await adminService.getAllUsers();
    if (users.length == 0) {
      return response.status(StatusCodes.OK).json([]);
    } else {
      return response.status(StatusCodes.OK).json(users);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const getAllBookings = async (request, response) => {
  try {
    const bookings = await adminService.getAllBookings();
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

const getAllFlights = async (request, response) => {
  try {
    const flights = await adminService.getAllFlightInstances();
    if (flights.length == 0) {
      return response.status(StatusCodes.OK).json([]);
    } else {
      return response.status(StatusCodes.OK).json(flights);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const updateFlightStatus = async (request, response) => {
  const { id } = request.params;
  const { status } = request.body;
  try {
    const updatedStatus = await adminService.updateFlightStatus(id, status);
    if (!updatedStatus) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: `Failed to update the id - ${id}`
      });
    } else {
      return response.status(StatusCodes.OK).json(updatedStatus);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const deleteFlightInstance = async (request, response) => {
  const { id } = request.params;
  try {
    const deleteStatus = await adminService.deleteFlightInstance(id);
    if (!deleteStatus) {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: `Invalid Id - ${id} is not found`
      });
    } else {
      return response.status(StatusCodes.OK).json({
        message: `Id - ${id} got deleted successfully`
      });
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const cancelBooking = async (request, response) => {
  const { id } = request.params;
  try {
    const cancelStatus = await adminService.cancelBooking(id);
    if (!cancelStatus) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: `Failed to cancel booking - ${id}`
      });
    } else {
      return response.status(StatusCodes.OK).json(cancelStatus);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllBookings,
  getAllFlights,
  updateFlightStatus,
  deleteFlightInstance,
  cancelBooking
};
