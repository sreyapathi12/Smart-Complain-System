/* ============================================
   AUTH CONTROLLER.JS — Login / Register / Me
   ============================================
   NOTE: Uses temporary in-memory data arrays.
   These will be replaced with MongoDB models in Phase 3.
   ============================================ */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateCitizenId } = require('../utils/generateId');

// ---- Temporary In-Memory Data Stores (Phase 3 will replace with DB) ----
let citizens = [
  { id: 'CIT001', name: 'Ravi Kumar', email: 'ravi@gmail.com', mobile: '9876543210', password: 'citizen123', ward: 'Ward 3', address: '12-3, MG Road, Ward 3', aadhaar: 'XXXX-XXXX-3210' },
  { id: 'CIT002', name: 'Lakshmi Devi', email: 'lakshmi@gmail.com', mobile: '9876543211', password: 'citizen123', ward: 'Ward 5', address: '45, Nehru Street, Ward 5', aadhaar: 'XXXX-XXXX-3211' },
  { id: 'CIT003', name: 'Suresh Babu', email: 'suresh@gmail.com', mobile: '9876543212', password: 'citizen123', ward: 'Ward 7', address: '78, RTC Colony, Ward 7', aadhaar: 'XXXX-XXXX-3212' }
];

let officers = [
  { id: 'OFF001', name: 'K. Srikanth Reddy', email: 'water.officer@secretariat.gov.in', officerId: 'WO-2024-001', password: 'officer123', department: 'Water Officer', category: 'Water Supply', designation: 'Assistant Engineer', phone: '040-27654321' },
  { id: 'OFF002', name: 'P. Venkata Rao', email: 'elec.officer@secretariat.gov.in', officerId: 'EO-2024-002', password: 'officer123', department: 'Electricity Officer', category: 'Electricity', designation: 'Junior Engineer', phone: '040-27654322' },
  { id: 'OFF003', name: 'B. Ramesh Kumar', email: 'roads.officer@secretariat.gov.in', officerId: 'RO-2024-003', password: 'officer123', department: 'Roads Officer', category: 'Roads', designation: 'Assistant Engineer', phone: '040-27654323' },
  { id: 'OFF004', name: 'M. Padmaja', email: 'san.officer@secretariat.gov.in', officerId: 'SO-2024-004', password: 'officer123', department: 'Sanitation Officer', category: 'Sanitation', designation: 'Sanitary Inspector', phone: '040-27654324' },
  { id: 'OFF005', name: 'Dr. N. Sudhakar', email: 'health.officer@secretariat.gov.in', officerId: 'HO-2024-005', password: 'officer123', department: 'Health Officer', category: 'Public Health', designation: 'Health Officer', phone: '040-27654325' },
  { id: 'OFF006', name: 'G. Laxmi Narayana', email: 'sl.officer@secretariat.gov.in', officerId: 'SLO-2024-006', password: 'officer123', department: 'Electricity Officer', category: 'Street Lights', designation: 'Electrical Supervisor', phone: '040-27654326' },
  { id: 'OFF007', name: 'S. Anantha Reddy', email: 'drain.officer@secretariat.gov.in', officerId: 'DO-2024-007', password: 'officer123', department: 'Sanitation Officer', category: 'Drainage', designation: 'Drainage Inspector', phone: '040-27654327' }
];

// Export for use by other controllers (temporary, until DB)
module.exports.__citizens = citizens;
module.exports.__officers = officers;

/**
 * Helper: sign a JWT for a user
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * @desc    Citizen Login
 * @route   POST /api/auth/citizen/login
 * @access  Public
 * @body    { identifier (mobile or email), password }
 */
async function citizenLogin(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return errorResponse(res, 400, 'Mobile/email and password are required.');
    }

    const citizen = citizens.find(
      c => (c.mobile === identifier || c.email === identifier.toLowerCase())
    );

    if (!citizen || citizen.password !== password) {
      return errorResponse(res, 401, 'Invalid credentials. Please check mobile/email and password.');
    }

    const token = signToken({
      id: citizen.id,
      role: 'citizen',
      name: citizen.name,
      mobile: citizen.mobile,
      ward: citizen.ward
    });

    const { password: _pw, ...citizenData } = citizen;

    return successResponse(res, 200, 'Login successful', {
      token,
      user: { ...citizenData, role: 'citizen' }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Citizen Registration
 * @route   POST /api/auth/citizen/register
 * @access  Public
 * @body    { name, mobile, email, ward, address, password }
 */
async function citizenRegister(req, res, next) {
  try {
    const { name, mobile, email, ward, address, password } = req.body;

    if (!name || !mobile || !email || !ward || !address || !password) {
      return errorResponse(res, 400, 'All fields are required.');
    }

    if (!/^\d{10}$/.test(mobile)) {
      return errorResponse(res, 400, 'Enter a valid 10-digit mobile number.');
    }

    const exists = citizens.find(c => c.mobile === mobile || c.email === email.toLowerCase());
    if (exists) {
      return errorResponse(res, 409, 'A citizen with this mobile number or email already exists.');
    }

    const newCitizen = {
      id: generateCitizenId(citizens.length),
      name,
      mobile,
      email: email.toLowerCase(),
      ward,
      address,
      password, // NOTE: plaintext for demo; hash with bcrypt when DB is added
      aadhaar: 'XXXX-XXXX-' + mobile.slice(-4)
    };

    citizens.push(newCitizen);

    const token = signToken({
      id: newCitizen.id,
      role: 'citizen',
      name: newCitizen.name,
      mobile: newCitizen.mobile,
      ward: newCitizen.ward
    });

    const { password: _pw, ...citizenData } = newCitizen;

    return successResponse(res, 201, 'Registration successful', {
      token,
      user: { ...citizenData, role: 'citizen' }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Officer Login
 * @route   POST /api/auth/officer/login
 * @access  Public
 * @body    { officerId, password }
 */
async function officerLogin(req, res, next) {
  try {
    const { officerId, password } = req.body;

    if (!officerId || !password) {
      return errorResponse(res, 400, 'Officer ID and password are required.');
    }

    const officer = officers.find(o => o.officerId === officerId);

    if (!officer || officer.password !== password) {
      return errorResponse(res, 401, 'Invalid Officer ID or password.');
    }

    const token = signToken({
      id: officer.id,
      role: 'officer',
      name: officer.name,
      officerId: officer.officerId,
      department: officer.department,
      category: officer.category
    });

    const { password: _pw, ...officerData } = officer;

    return successResponse(res, 200, 'Login successful', {
      token,
      user: { ...officerData, role: 'officer' }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
async function getMe(req, res, next) {
  try {
    const { id, role } = req.user;

    if (role === 'citizen') {
      const citizen = citizens.find(c => c.id === id);
      if (!citizen) return errorResponse(res, 404, 'Citizen not found.');
      const { password, ...data } = citizen;
      return successResponse(res, 200, 'User fetched', { ...data, role: 'citizen' });
    }

    if (role === 'officer') {
      const officer = officers.find(o => o.id === id);
      if (!officer) return errorResponse(res, 404, 'Officer not found.');
      const { password, ...data } = officer;
      return successResponse(res, 200, 'User fetched', { ...data, role: 'officer' });
    }

    return errorResponse(res, 400, 'Unknown role.');
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Logout (stateless JWT — client deletes token; endpoint provided for consistency)
 * @route   POST /api/auth/logout
 * @access  Private
 */
async function logout(req, res, next) {
  try {
    return successResponse(res, 200, 'Logged out successfully', null);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  citizenLogin,
  citizenRegister,
  officerLogin,
  getMe,
  logout,
  __citizens: citizens,
  __officers: officers
};
