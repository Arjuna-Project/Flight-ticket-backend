const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:id/cancel', adminController.cancelBooking);
router.get('/flights', adminController.getAllFlights);
router.patch('/flights/:id/status', adminController.updateFlightStatus);
router.delete('/flights/:id', adminController.deleteFlightInstance);

module.exports = router;
