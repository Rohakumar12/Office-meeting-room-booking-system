const bookingService = require('../services/bookingService');
const ApiResponse = require('../utils/ApiResponse');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user._id);
    return res
      .status(201)
      .json(new ApiResponse(201, { booking }, 'Room booked successfully'));
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;

    // /api/bookings is the current user's personal booking list.
    // Admins use /api/admin/bookings for company-wide results.
    filters.userId = req.user._id;

    const result = await bookingService.getBookings(filters, page, limit);
    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Bookings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { booking }, 'Booking retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { booking }, 'Booking updated successfully'));
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return res
      .status(200)
      .json(new ApiResponse(200, { booking }, 'Booking cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { roomId, date, startTime, endTime, capacity, amenities } = req.query;

    if (roomId && startTime && endTime) {
      const conflict = await bookingService.checkOverlap(roomId, date, startTime, endTime);
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            isAvailable: !conflict,
            conflict: conflict || null,
          },
          conflict ? 'Time slot is already booked' : 'Time slot is available'
        )
      );
    }

    const roomService = require('../services/roomService');
    if (roomId && date) {
      const schedule = await roomService.getRoomSchedule(roomId, date);
      return res.status(200).json(
        new ApiResponse(200, schedule, 'Room schedule retrieved successfully')
      );
    }

    const rooms = await roomService.getAvailableRooms({
      date,
      startTime,
      endTime,
      capacity,
      amenities,
    });

    return res.status(200).json(
      new ApiResponse(200, { rooms, count: rooms.length }, 'Available rooms retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkAvailability,
};
