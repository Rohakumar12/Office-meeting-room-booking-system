const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const BookingSlot = require('../models/BookingSlot');
const Room = require('../models/Room');
const ApiError = require('../utils/ApiError');
const {
  isValidTimeRange,
  isWithinOfficeHours,
  isPastDate,
  normalizeDate,
} = require('../utils/timeUtils');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * Check for overlapping bookings (excluding a specific booking for edit scenarios)
 */
const checkOverlap = async (roomId, date, startTime, endTime, excludeBookingId = null) => {
  const normalizedDate = normalizeDate(date);
  const query = {
    roomId,
    date: normalizedDate,
    status: BOOKING_STATUS.CONFIRMED,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query).populate('userId', 'name email');
  return conflict;
};

/**
 * Validate booking business rules
 */
const validateBookingRules = async (roomId, date, startTime, endTime, attendees) => {
  // Validate time range
  if (!isValidTimeRange(startTime, endTime)) {
    throw new ApiError(400, 'End time must be after start time');
  }

  // Validate office hours
  if (!isWithinOfficeHours(startTime, endTime)) {
    throw new ApiError(400, 'Bookings must be within office hours (08:00 AM - 08:00 PM)');
  }

  // Validate not in the past
  if (isPastDate(date, startTime)) {
    throw new ApiError(400, 'Cannot book a room in the past');
  }

  // Validate room exists and is active
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }
  if (!room.isActive) {
    throw new ApiError(400, 'This room is currently not available for booking');
  }

  // Validate capacity
  if (attendees && attendees > room.capacity) {
    throw new ApiError(
      400,
      `Room capacity (${room.capacity}) is less than the number of attendees (${attendees})`
    );
  }

  return room;
};

/**
 * Create a booking with concurrent booking protection using MongoDB transactions
 * (with fallback for standalone MongoDB deployments)
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const reservationSlots = (roomId, bookingId, date, startTime, endTime) => {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  for (let minute = start; minute < end; minute += 1) {
    slots.push({ roomId, bookingId, date, minute });
  }
  return slots;
};

const reserveSlots = async (roomId, bookingId, date, startTime, endTime) => {
  try {
    await BookingSlot.insertMany(
      reservationSlots(roomId, bookingId, date, startTime, endTime),
      {
        ordered: true,
      },
    ); //So ordered means the operations are processed in order and the batch stops at the first error.
  } catch (error) {
    // insertMany can have inserted a prefix before discovering a duplicate.
    await BookingSlot.deleteMany({ bookingId });
    if (error?.code === 11000) {
      throw new ApiError(409, 'Room is already booked for this time slot');
    }
    throw error;
  }
};

const createBooking = async (bookingData, userId) => {
  const { roomId, title, description, date, startTime, endTime, attendees } = bookingData;

  // Validate rules before attempting booking
  await validateBookingRules(roomId, date, startTime, endTime, attendees);

  const normalizedDate = normalizeDate(date);

  try {
    // Preserve compatibility with bookings created before BookingSlot existed.
    const overlap = await checkOverlap(roomId, normalizedDate, startTime, endTime);
    if (overlap) throw new ApiError(409, 'Room is already booked for this time slot');

    const bookingId = new mongoose.Types.ObjectId();// manually created id
    await reserveSlots(roomId, bookingId, normalizedDate, startTime, endTime);
    let booking;
    try {
      booking = await Booking.create({
        _id: bookingId, roomId, userId, title, description, date: normalizedDate,
        startTime, endTime, attendees, status: BOOKING_STATUS.CONFIRMED,
      });
    } catch (error) {
      await BookingSlot.deleteMany({ bookingId });
      throw error;
    }

    await booking.populate([
      { path: 'roomId', select: 'name location floor capacity amenities image' },
      { path: 'userId', select: 'name email department' },
    ]);// path tell which field have refernce and and i want only that fields in that table ->select
    return booking;
  } catch (error) {
    throw error;
  }
};

/**
 * Get bookings with filters
 */
const getBookings = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.roomId) query.roomId = filters.roomId;
  if (filters.status) query.status = filters.status;

  if (filters.date) {
    const d = normalizeDate(filters.date);
    query.date = d;
  }
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('roomId', 'name location floor capacity amenities image')
      .populate('userId', 'name email department employeeId')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(query),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single booking by ID
 */
const getBookingById = async (bookingId, userId = null, userRole = null) => {
  const booking = await Booking.findById(bookingId)
    .populate('roomId', 'name location floor capacity amenities image')
    .populate('userId', 'name email department employeeId')
    .populate('cancelledBy', 'name email');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Non-admin users can only view their own bookings
  if (userRole !== 'admin' && userId && booking.userId._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied. You can only view your own bookings.');
  }

  return booking;
};

/**
 * Update a booking
 */
const updateBooking = async (bookingId, updateData, userId, userRole) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Only owner or admin can update
  if (userRole !== 'admin' && booking.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied. You can only edit your own bookings.');
  }

  // Cannot update cancelled bookings
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, 'Cannot edit a cancelled booking');
  }

  // Cannot update completed bookings
  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new ApiError(400, 'Cannot edit a completed booking');
  }

  const newDate = updateData.date || booking.date;
  const newStartTime = updateData.startTime || booking.startTime;
  const newEndTime = updateData.endTime || booking.endTime;
  const slotChanged = Boolean(updateData.date || updateData.startTime || updateData.endTime);

  // Validate time range if times are being changed
  if (slotChanged) {
    if (!isValidTimeRange(newStartTime, newEndTime)) {
      throw new ApiError(400, 'End time must be after start time');
    }
    if (!isWithinOfficeHours(newStartTime, newEndTime)) {
      throw new ApiError(400, 'Bookings must be within office hours (08:00 AM - 08:00 PM)');
    }
    if (isPastDate(newDate, newStartTime)) {
      throw new ApiError(400, 'Cannot move a booking to the past');
    }
  }

  // Check for overlap (excluding this booking)
  if (updateData.date || updateData.startTime || updateData.endTime) {
    const conflict = await checkOverlap(
      booking.roomId,
      newDate,
      newStartTime,
      newEndTime,
      bookingId
    );
    if (conflict) {
      throw new ApiError(409, 'Room is already booked for this time slot');
    }
  }

  // Normalize date if provided
  if (updateData.date) {
    updateData.date = normalizeDate(updateData.date);
  }

  // Keep the database-backed reservation slots in sync with rescheduled
  // bookings. Releasing first means a failed reschedule leaves the original
  // booking intact and its slot reservation is restored below.
  if (slotChanged) {
    const originalSlots = reservationSlots(
      booking.roomId,
      booking._id,
      booking.date,
      booking.startTime,
      booking.endTime
    );
    await BookingSlot.deleteMany({ bookingId: booking._id });
    try {
      await reserveSlots(
        booking.roomId,
        booking._id,
        updateData.date || booking.date,
        newStartTime,
        newEndTime
      );
    } catch (error) {
      // Best-effort restoration keeps existing bookings protected if a
      // reschedule loses a race to another reservation.
      await BookingSlot.insertMany(originalSlots, { ordered: false }).catch(() => {});
      throw error;
    }
  }

  let updatedBooking;
  try {
    updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('roomId', 'name location floor capacity amenities image')
      .populate('userId', 'name email department');
  } catch (error) {
    if (slotChanged) {
      await BookingSlot.deleteMany({ bookingId: booking._id });
      await BookingSlot.insertMany(
        reservationSlots(booking.roomId, booking._id, booking.date, booking.startTime, booking.endTime),
        { ordered: false }
      ).catch(() => {});
    }
    throw error;
  }

  return updatedBooking;
};

/**
 * Cancel a booking
 */
const cancelBooking = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Only owner or admin can cancel
  if (userRole !== 'admin' && booking.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied. You can only cancel your own bookings.');
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, 'Booking is already cancelled');
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new ApiError(400, 'Cannot cancel a completed booking');
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();
  booking.cancelledBy = userId;
  await booking.save();
  await BookingSlot.deleteMany({ bookingId: booking._id });

  await booking.populate([
    { path: 'roomId', select: 'name location floor' },
    { path: 'userId', select: 'name email' },
  ]);

  return booking;
};

/**
 * Auto-complete past bookings (utility - can be run via cron)
 */
const completePastBookings = async () => {
  const now = new Date();
  const today = normalizeDate(now);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  await Booking.updateMany(
    {
      status: BOOKING_STATUS.CONFIRMED,
      $or: [
        { date: { $lt: today } },
        { date: today, endTime: { $lt: currentTime } },
      ],
    },
    { status: BOOKING_STATUS.COMPLETED }
  );
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkOverlap,
  completePastBookings,
};
