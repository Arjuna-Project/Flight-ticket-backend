const flightService = require('../services/flight.service');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');

const searchFlights = async (request, response) => {
  try {
    const { from, to, date, passengers, class: travelClass } = request.query;
    
    // Very basic validation, can be expanded with Joi
    if (!from || !to || !date || !passengers) {
      return response.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Please provide from, to, date, and passengers' 
      });
    }

    const payload = {
      from, 
      to, 
      date, 
      passengers: parseInt(passengers, 10), 
      travelClass 
    };

    const flights = await flightService.searchFlights(payload);
    
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

const getFlightInstanceById = async (request, response) => {
  const { id } = request.params;
  try {
    const flight = await flightService.getFlightInstanceById(id);
    if (!flight) {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: `Flight not found for id - ${id}`
      });
    } else {
      return response.status(StatusCodes.OK).json(flight);
    }
  } catch (error) {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  searchFlights,
  getFlightInstanceById
};
