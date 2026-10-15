/* ============================================
   OFFICER CONTROLLER.JS — Officer Profile & Dashboard
   ============================================
   NOTE: Reuses in-memory officers/complaints arrays
   exported from authController/complaintController.
   Will be replaced with MongoDB models in Phase 3.
   ============================================ */

const { successResponse, errorResponse } = require('../utils/apiResponse');
const { __officers: officers } = require('./authController');
const { __complaints: complaints } = require('./complaintController');

/**
 * @desc    Get officer profile
 * @route   GET /api/officers/profile
 * @access  Private (Officer)
 */
async function getProfile(req, res, next) {
  try {
    const officer = officers.find(o => o.id === req.user.id);
    if (!officer) return errorResponse(res, 404, 'Officer profile not found.');

    const { password, ...data } = officer;
    return successResponse(res, 200, 'Profile fetched', data);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update officer profile (limited fields)
 * @route   PUT /api/officers/profile
 * @access  Private (Officer)
 * @body    { name, phone, email }
 */
async function updateProfile(req, res, next) {
  try {
    const officer = officers.find(o => o.id === req.user.id);
    if (!officer) return errorResponse(res, 404, 'Officer profile not found.');

    const { name, phone, email } = req.body;

    if (name)  officer.name = name;
    if (phone) officer.phone = phone;
    if (email) officer.email = email.toLowerCase();

    const { password, ...data } = officer;
    return successResponse(res, 200, 'Profile updated successfully', data);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Change officer password
 * @route   PUT /api/officers/change-password
 * @access  Private (Officer)
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

    const officer = officers.find(o => o.id === req.user.id);
    if (!officer) return errorResponse(res, 404, 'Officer profile not found.');

    if (officer.password !== currentPassword) {
      return errorResponse(res, 401, 'Current password is incorrect.');
    }

    officer.password = newPassword; // NOTE: hash with bcrypt once DB is added

    return successResponse(res, 200, 'Password changed successfully', null);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get officer dashboard summary (stats + recent complaints in their department)
 * @route   GET /api/officers/dashboard
 * @access  Private (Officer)
 */
async function getDashboard(req, res, next) {
  try {
    const officer = officers.find(o => o.id === req.user.id);
    if (!officer) return errorResponse(res, 404, 'Officer profile not found.');

    const departmentComplaints = complaints.filter(c => c.assignedOfficer === officer.department);

    const stats = {
      total: departmentComplaints.length,
      pending: departmentComplaints.filter(c => c.status === 'Pending').length,
      inProgress: departmentComplaints.filter(c => c.status === 'In Progress').length,
      resolved: departmentComplaints.filter(c => c.status === 'Resolved').length
    };

    const recent = departmentComplaints
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return successResponse(res, 200, 'Dashboard data fetched', {
      officer: { name: officer.name, department: officer.department, category: officer.category, designation: officer.designation },
      stats,
      recentComplaints: recent
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, changePassword, getDashboard };
