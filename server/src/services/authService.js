const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { COOKIE_CONFIG } = require('../config/constants');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Send token via HTTP-only cookie and JSON response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  res.cookie('token', token, COOKIE_CONFIG);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        avatar: user.avatar || null,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    },
  });
};

/**
 * Register a new employee
 */
const register = async ({ name, email, password, department, employeeId, avatar }) => {
  // Check duplicate email
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Check duplicate employeeId if provided
  if (employeeId) {
    const existingEmpId = await User.findOne({ employeeId });
    if (existingEmpId) {
      throw new ApiError(409, 'This employee ID is already registered');
    }
  }

  const user = await User.create({
    name,
    email,
    password,
    department,
    employeeId,
    avatar: avatar || null,
    role: 'employee',
  });

  return user;
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Include password in query
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact admin.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return user;
};

/**
 * Get current user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = { register, login, getMe, generateToken, sendTokenResponse };
