const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkAvailability,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createBookingSchema,
  updateBookingSchema,
} = require('../validators/bookingValidators');

// All booking routes require authentication
router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getBookings);
router.get('/availability', checkAvailability);
router.get('/:id', getBookingById);
router.put('/:id', validate(updateBookingSchema), updateBooking);
router.delete('/:id', cancelBooking); // DELETE = cancel (soft delete)

module.exports = router;
