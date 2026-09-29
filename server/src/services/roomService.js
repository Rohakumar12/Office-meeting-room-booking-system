const Room = require('../models/Room');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

/**
 * Get all rooms with filtering and pagination
 */
const getRooms = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters .isActive;
  }

  if (filters.capacity) {
    query.capacity = { $gte: parseInt(filters.capacity) };
  }

  if (filters.floor) {
    query.floor = filters.floor;
  }

  if (filters.amenities) {
    const amenitiesArray = Array.isArray(filters.amenities)
      ? filters.amenities
      : [filters.amenities];
    query.amenities = { $all: amenitiesArray };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { location: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [rooms, total] = await Promise.all([
    Room.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Room.countDocuments(query),
  ]);

  return {
    rooms,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single room by ID
 */
const getRoomById = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }
  return room;
};

/**
 * Create a new room (admin only)
 */
const createRoom = async (roomData) => {
  const existing = await Room.findOne({ name: roomData.name });
  if (existing) {
    throw new ApiError(409, `A room with the name '${roomData.name}' already exists`);
  }

  const room = await Room.create(roomData);
  return room;
};

/**
 * Update a room (admin only)
 */
const updateRoom = async (roomId, updateData) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  // Check name uniqueness if name is being changed
  if (updateData.name && updateData.name !== room.name) {
    const existing = await Room.findOne({ name: updateData.name });
    if (existing) {
      throw new ApiError(409, `A room with the name '${updateData.name}' already exists`);
    }
  }

  const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedRoom;
};

/**
 * Delete a room (admin only)
 * Soft delete: deactivate if it has bookings; hard delete otherwise
 */
const deleteRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  // Check for existing bookings
  const bookingCount = await Booking.countDocuments({ roomId });
  if (bookingCount > 0) {
    // Soft delete — deactivate to preserve booking history
    room.isActive = false;
    await room.save();
    return {
      deleted: false,
      deactivated: true,
      message: `Room has ${bookingCount} booking record(s). Room has been deactivated instead of deleted to preserve history.`,
    };
  }

  await Room.findByIdAndDelete(roomId);
  return { deleted: true, deactivated: false, message: 'Room deleted successfully' };
};

/**
 * Get available rooms for a given date and time slot
 */
const getAvailableRooms = async ({ date, startTime, endTime, capacity, amenities }) => {
  // Build room filter
  const roomFilter = { isActive: true };
  if (capacity) roomFilter.capacity = { $gte: parseInt(capacity) };
  if (amenities) {
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    if (amenitiesArray.length > 0) {
      roomFilter.amenities = { $all: amenitiesArray };
    }
  }

  const allMatchingRooms = await Room.find(roomFilter);

  if (!startTime || !endTime) {
    return allMatchingRooms;
  }

  // Find overlapping bookings for all rooms on this date
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0);

  const overlappingBookings = await Booking.find({
    roomId: { $in: allMatchingRooms.map((r) => r._id) },
    date: normalizedDate,
    status: 'confirmed',
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  }).select('roomId');

  const bookedRoomIds = new Set(overlappingBookings.map((b) => b.roomId.toString()));

  return allMatchingRooms.filter((room) => !bookedRoomIds.has(room._id.toString()));
};

/**
 * Get time slots for a room on a specific date (for calendar view)
 */
const getRoomSchedule = async (roomId, date) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0);

  const bookings = await Booking.find({
    roomId,
    date: normalizedDate,
    status: 'confirmed',
  })
    .populate('userId', 'name email department')
    .sort({ startTime: 1 });

  return { room, bookings };
};

module.exports = {
  getRooms:getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomSchedule,
};
