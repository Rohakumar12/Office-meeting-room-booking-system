const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const { normalizeDate } = require('../utils/timeUtils');

/**
 * Get dashboard statistics
 */
const getStatistics = async () => {
  const today = normalizeDate(new Date());

  const [
    totalRooms,
    activeRooms,
    totalUsers,
    activeUsers,
    totalBookings,
    todayBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'employee' }),
    User.countDocuments({ role: 'employee', isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ date: today }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ status: 'completed' }),
  ]);

  // Room utilization: percentage of room-days with at least one booking (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const utilizationData = await Booking.aggregate([
    {
      $match: {
        status: { $in: ['confirmed', 'completed'] },
        date: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: { roomId: '$roomId', date: '$date' },
      },
    },
    {
      $count: 'uniqueRoomDays',
    },
  ]);

  const uniqueRoomDays = utilizationData[0]?.uniqueRoomDays || 0;
  const maxPossibleRoomDays = activeRooms * 30;
  const utilizationRate =
    maxPossibleRoomDays > 0
      ? Math.round((uniqueRoomDays / maxPossibleRoomDays) * 100)
      : 0;

  return {
    totalRooms,
    activeRooms,
    totalUsers,
    activeUsers,
    totalBookings,
    todayBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
    utilizationRate,
  };
};

/**
 * Get booking analytics for charts
 */
const getAnalytics = async ({ period = '7d' } = {}) => {
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setUTCHours(0, 0, 0, 0);

  // Daily bookings count
  const dailyBookings = await Booking.aggregate([
    {
      $match: {
        date: { $gte: startDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  // Booking status distribution
  const statusDistribution = await Booking.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
  ]);

  // Most used rooms
  const topRooms = await Booking.aggregate([
    {
      $match: {
        date: { $gte: startDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: '$roomId',
        bookings: { $sum: 1 },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: '_id',
        as: 'room',
      },
    },
    { $unwind: '$room' },
    {
      $project: {
        name: '$room.name',
        bookings: 1,
        _id: 0,
      },
    },
  ]);

  // Peak booking hours
  const peakHours = await Booking.aggregate([
    {
      $match: {
        date: { $gte: startDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: { $substr: ['$startTime', 0, 2] }, // Extract hour
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        hour: { $concat: ['$_id', ':00'] },
        count: 1,
        _id: 0,
      },
    },
  ]);

  // Room utilization
  const roomUtilization = await Booking.aggregate([
    {
      $match: {
        date: { $gte: startDate },
        status: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: '$roomId',
        totalBookings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: '_id',
        as: 'room',
      },
    },
    { $unwind: '$room' },
    {
      $project: {
        name: '$room.name',
        totalBookings: 1,
        utilization: {
          $multiply: [
            { $divide: ['$totalBookings', days * 12] }, // 12 possible slots per day (08-20, 1hr each)
            100,
          ],
        },
        _id: 0,
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);

  return {
    dailyBookings,
    statusDistribution,
    topRooms,
    peakHours,
    roomUtilization,
  };
};

/**
 * Get all users (admin)
 */
const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
  const query = { role: 'employee' };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { employeeId: { $regex: filters.search, $options: 'i' } },
      { department: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Toggle user active status (admin)
 */
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot deactivate an admin account');
  }

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

module.exports = {
  getStatistics,
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
};
