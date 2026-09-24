const ApiError = require('../utils/ApiError');

/**
 * Authorize based on user roles.
 * Usage: authorize('admin') or authorize('admin', 'employee')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
