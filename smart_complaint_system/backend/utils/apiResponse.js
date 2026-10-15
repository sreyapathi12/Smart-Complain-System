/* ============================================
   API RESPONSE.JS — Standardized Response Helper
   ============================================ */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object|array} data - Response payload
 */
function successResponse(res, statusCode = 200, message = 'Success', data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object|array} errors - Additional error details
 */
function errorResponse(res, statusCode = 500, message = 'Something went wrong', errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

module.exports = { successResponse, errorResponse };
