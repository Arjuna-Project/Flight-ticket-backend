const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');

// GET /api/flights/search
router.get('/search', flightController.searchFlights);

// GET /api/flights/:id
router.get('/:id', flightController.getFlightInstanceById);

module.exports = router;
