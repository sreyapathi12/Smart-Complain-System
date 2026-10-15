/* ============================================
   CITIZEN ROUTES.JS — /api/citizens
   ============================================ */

const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/citizenController');

const { protect, citizenOnly } = require('../middleware/authMiddleware');

// All routes below require citizen authentication
router.use(protect, citizenOnly);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
