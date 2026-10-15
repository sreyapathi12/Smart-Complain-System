/* ============================================
   COMPLAINT ROUTES.JS — /api/complaints
   ============================================ */

const express = require('express');
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  trackComplaint,
  updateComplaintStatus,
  addRemark,
  getStats,
  getCategoryReport
} = require('../controllers/complaintController');

const { protect, citizenOnly, officerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ---- Public Route (Track by ID — no login required) ----
router.get('/track/:id', trackComplaint);

// ---- Private Routes ----
router.post('/', protect, citizenOnly, upload.single('image'), createComplaint);
router.get('/', protect, getComplaints);
router.get('/stats', protect, getStats);
router.get('/reports/category', protect, officerOnly, getCategoryReport);
router.get('/:id', protect, getComplaintById);

// ---- Officer Actions ----
router.patch('/:id/status', protect, officerOnly, updateComplaintStatus);
router.post('/:id/remarks', protect, officerOnly, addRemark);

module.exports = router;
