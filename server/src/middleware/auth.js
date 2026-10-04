const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { JWT_CONFIG } = require('../config/constants');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // Cookies issued before refresh tokens were introduced. They self-expire
    // within the old 7 day window, so this can be dropped once they have.
    else if (req.cookies && req.cookies.token) {
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
      decoded = jwt.verify(token, JWT_CONFIG.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // The client interceptor treats this as "try the refresh token first".
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
