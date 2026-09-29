const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { COOKIE_CONFIG, SESSION_COOKIE_CONFIG } = require('../config/constants');

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
 *
 * options.rememberMe === false -> session cookie (cleared when the browser closes)
 * otherwise                    -> persistent cookie (COOKIE_CONFIG)
 */
const sendTokenResponse = (user, statusCode, res, message, options = {}) => {
  const token = generateToken(user._id);
  const cookieConfig =
    options.rememberMe === false ? SESSION_COOKIE_CONFIG : COOKIE_CONFIG;

  res.cookie('token', token, cookieConfig);

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
const register = async ({ name, email, password, department, employeeId }) => {
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
