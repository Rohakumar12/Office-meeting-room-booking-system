const adminService = require('../services/adminService');
const bookingService = require('../services/bookingService');
const roomService = require('../services/roomService');
const ApiResponse = require('../utils/ApiResponse');

const getStatistics = async (req, res, next) => {
  try {
    const stats = await adminService.getStatistics();
    return res
      .status(200)
      .json(new ApiResponse(200, stats, 'Statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, analytics, 'Analytics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await adminService.getAllUsers(filters, page, limit);
    return res.status(200).json(new ApiResponse(200, result, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    const action = user.isActive ? 'activated' : 'deactivated';
    return res
      .status(200)
      .json(new ApiResponse(200, { user }, `User ${action} successfully`));
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await bookingService.getBookings(filters, page, limit);
    return res
      .status(200)
      .json(new ApiResponse(200, result, 'All bookings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllRooms = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await roomService.getRooms(filters, page, limit);
    return res
      .status(200)
      .json(new ApiResponse(200, result, 'All rooms retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getAllRooms,
};
