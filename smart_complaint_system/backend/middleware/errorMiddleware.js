/* ============================================
   ERROR MIDDLEWARE.JS — Global Error Handling
   ============================================ */

const { errorResponse } = require('../utils/apiResponse');

// ---- 404 Not Found Handler ----
function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

// ---- Global Error Handler ----
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum allowed size is 5MB.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${message}`);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  return errorResponse(res, statusCode, message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

module.exports = { notFound, errorHandler };
