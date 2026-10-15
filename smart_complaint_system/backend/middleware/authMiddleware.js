/* ============================================
   AUTH MIDDLEWARE.JS — JWT Verification & Role Guards
   ============================================ */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Verify JWT token from Authorization header (Bearer <token>)
 * Attaches decoded payload to req.user
 */
function protect(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, role, category(optional), name, email }
    next();
  } catch (err) {
    return errorResponse(res, 401, 'Not authorized. Invalid or expired token.');
  }
}

/**
 * Restrict route access to citizens only
 */
function citizenOnly(req, res, next) {
  if (!req.user || req.user.role !== 'citizen') {
    return errorResponse(res, 403, 'Access denied. Citizen account required.');
  }
  next();
}

/**
 * Restrict route access to officers only
 */
function officerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'officer') {
    return errorResponse(res, 403, 'Access denied. Officer account required.');
  }
  next();
}

/**
 * Generic role guard - pass allowed roles as arguments
 * Usage: authorizeRoles('officer', 'citizen')
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, `Access denied. Requires role: ${roles.join(', ')}`);
    }
    next();
  };
}

module.exports = { protect, citizenOnly, officerOnly, authorizeRoles };
