/* ============================================
   AUTH ROUTES.JS — /api/auth
   ============================================ */

const express = require('express');
const router = express.Router();

const {
  citizenLogin,
  citizenRegister,
  officerLogin,
  getMe,
  logout
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ---- Public Routes ----
router.post('/citizen/login', citizenLogin);
router.post('/citizen/register', citizenRegister);
router.post('/officer/login', officerLogin);

// ---- Private Routes ----
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
