const flightService = require('../services/flight.service');

const searchFlights = async (req, res, next) => {
  try {
    const { from, to, date, passengers, class: travelClass } = req.query;
    
    // Very basic validation, can be expanded with Joi
    if (!from || !to || !date || !passengers) {
      return res.status(400).json({ message: 'Please provide from, to, date, and passengers' });
    }

    const flights = await flightService.searchFlights({ 
      from, 
      to, 
      date, 
      passengers: parseInt(passengers, 10), 
      travelClass 
    });

    res.json(flights);
  } catch (error) {
    next(error);
  }
};

const getFlightInstanceById = async (req, res, next) => {
  try {
    const flight = await flightService.getFlightInstanceById(req.params.id);
    res.json(flight);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchFlights,
  getFlightInstanceById
};
