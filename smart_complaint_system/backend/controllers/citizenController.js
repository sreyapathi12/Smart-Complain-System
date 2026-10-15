/* ============================================
   CITIZEN CONTROLLER.JS — Citizen Profile Management
   ============================================
   NOTE: Reuses the in-memory citizens array exported
   from authController. Will be replaced with MongoDB
   models in Phase 3.
   ============================================ */

const { successResponse, errorResponse } = require('../utils/apiResponse');
const { __citizens: citizens } = require('./authController');

/**
 * @desc    Get citizen profile by authenticated user ID
 * @route   GET /api/citizens/profile
 * @access  Private (Citizen)
 */
async function getProfile(req, res, next) {
  try {
    const citizen = citizens.find(c => c.id === req.user.id);
    if (!citizen) return errorResponse(res, 404, 'Citizen profile not found.');

    const { password, ...data } = citizen;
    return successResponse(res, 200, 'Profile fetched', data);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update citizen profile
 * @route   PUT /api/citizens/profile
 * @access  Private (Citizen)
 * @body    { name, mobile, email, ward, address }
 */
async function updateProfile(req, res, next) {
  try {
    const citizen = citizens.find(c => c.id === req.user.id);
    if (!citizen) return errorResponse(res, 404, 'Citizen profile not found.');

    const { name, mobile, email, ward, address } = req.body;

    if (mobile && !/^\d{10}$/.test(mobile)) {
      return errorResponse(res, 400, 'Enter a valid 10-digit mobile number.');
    }

    if (name)    citizen.name = name;
    if (mobile)  citizen.mobile = mobile;
    if (email)   citizen.email = email.toLowerCase();
    if (ward)    citizen.ward = ward;
    if (address) citizen.address = address;

    const { password, ...data } = citizen;
    return successResponse(res, 200, 'Profile updated successfully', data);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Change citizen password
 * @route   PUT /api/citizens/change-password
 * @access  Private (Citizen)
 * @body    { currentPassword, newPassword }
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current and new password are required.');
    }
    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long.');
    }

    const citizen = citizens.find(c => c.id === req.user.id);
    if (!citizen) return errorResponse(res, 404, 'Citizen profile not found.');

    if (citizen.password !== currentPassword) {
      return errorResponse(res, 401, 'Current password is incorrect.');
    }

    citizen.password = newPassword; // NOTE: hash with bcrypt once DB is added

    return successResponse(res, 200, 'Password changed successfully', null);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, changePassword };
