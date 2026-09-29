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
  uploadRoomImage,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { uploadRoomImage: uploadRoomImageFile } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
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
// uploadLimiter runs before multer so rejected uploads never touch disk.
router.post(
  '/image',
  protect,
  authorize('admin'),
  uploadLimiter,
  uploadRoomImageFile,
  uploadRoomImage,
);
router.post('/', protect, authorize('admin'), validate(createRoomSchema), createRoom);
router.put('/:id', protect, authorize('admin'), validate(updateRoomSchema), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
