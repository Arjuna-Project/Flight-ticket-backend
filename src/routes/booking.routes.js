const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect all booking routes
router.use(authMiddleware);

// POST /api/bookings
router.post('/', bookingController.createBooking);

// GET /api/bookings/my-bookings
router.get('/my-bookings', bookingController.getUserBookings);

// GET /api/bookings/:id
router.get('/:id', bookingController.getBookingById);

module.exports = router;
