const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomSchedule,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
  createRoomSchema,
  updateRoomSchema,
} = require('../validators/roomValidators');

// Public/Employee routes
router.get('/available', protect, getAvailableRooms);
router.get('/', protect, getRooms);
router.get('/:id', protect, getRoomById);
router.get('/:id/schedule', protect, getRoomSchedule);

// Admin only routes
router.post('/', protect, authorize('admin'), validate(createRoomSchema), createRoom);
router.put('/:id', protect, authorize('admin'), validate(updateRoomSchema), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
