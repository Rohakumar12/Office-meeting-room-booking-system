const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header for API clients/testing
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Not authenticated. Please log in.'));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Session expired. Please log in again.'));
      }
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }

    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'User no longer exists.'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated. Contact admin.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
