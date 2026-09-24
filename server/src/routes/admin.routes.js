const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllBookings,
  getAllRooms,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/statistics', getStatistics);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/bookings', getAllBookings);
router.get('/rooms', getAllRooms);

module.exports = router;
