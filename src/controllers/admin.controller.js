const adminService = require('../services/admin.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    const recentBookings = await adminService.getRecentBookings(10);
    res.json({ stats, recentBookings });
  } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
  try { res.json(await adminService.getAllUsers()); } catch (error) { next(error); }
};

const getAllBookings = async (req, res, next) => {
  try { res.json(await adminService.getAllBookings()); } catch (error) { next(error); }
};

const getAllFlights = async (req, res, next) => {
  try { res.json(await adminService.getAllFlightInstances()); } catch (error) { next(error); }
};

const updateFlightStatus = async (req, res, next) => {
  try { res.json(await adminService.updateFlightStatus(req.params.id, req.body.status)); } catch (error) { next(error); }
};

const deleteFlightInstance = async (req, res, next) => {
  try { res.json(await adminService.deleteFlightInstance(req.params.id)); } catch (error) { next(error); }
};

const cancelBooking = async (req, res, next) => {
  try { res.json(await adminService.cancelBooking(req.params.id)); } catch (error) { next(error); }
};

module.exports = {
  getDashboardStats, getAllUsers, getAllBookings, getAllFlights,
  updateFlightStatus, deleteFlightInstance, cancelBooking
};
