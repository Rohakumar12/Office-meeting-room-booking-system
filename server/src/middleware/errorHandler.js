const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    console.error('ERROR CAUGHT IN TEST:', err);
  }
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    // Never echo the value back for identifying fields: returning the submitted
    // email would let anyone probe which accounts exist (account enumeration).
    const safeFields = ['email', 'employeeId'];
    message = safeFields.includes(field)
      ? `That ${field === 'email' ? 'email address' : 'employee ID'} is already registered`
      : `${label} already exists`;
    errors = [{ field, message }];
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5 MB'
        : 'Invalid image upload';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't leak internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
