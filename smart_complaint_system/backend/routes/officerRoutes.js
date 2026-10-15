/* ============================================
   OFFICER ROUTES.JS — /api/officers
   ============================================ */

const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  getDashboard
} = require('../controllers/officerController');

const { protect, officerOnly } = require('../middleware/authMiddleware');

// All routes below require officer authentication
router.use(protect, officerOnly);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/dashboard', getDashboard);

module.exports = router;
