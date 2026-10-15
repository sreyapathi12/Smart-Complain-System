/* ============================================
   COMPLAINT CONTROLLER.JS — Complaint CRUD & Tracking
   ============================================
   NOTE: Uses temporary in-memory data array.
   Will be replaced with MongoDB models in Phase 3.
   ============================================ */

const config = require('../config/config');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateComplaintId, generateRemarkId } = require('../utils/generateId');

// ---- Temporary In-Memory Complaint Store (Phase 3 will replace with DB) ----
let complaints = [
  {
    id: 'GRV-2024-0001', citizenId: 'CIT001', citizenName: 'Ravi Kumar', mobile: '9876543210',
    category: 'Water Supply', location: 'Ward 3, MG Road', title: 'No water supply for 5 days',
    description: 'There has been no water supply in our area for the past 5 days. Please look into this matter urgently.',
    image: null, status: 'Resolved', date: '2024-11-01', resolvedDate: '2024-11-04',
    officerRemark: 'Pipeline repaired. Water supply restored. Issue resolved.',
    assignedOfficer: 'Water Officer', priority: 'High', remarks: []
  },
  {
    id: 'GRV-2024-0002', citizenId: 'CIT002', citizenName: 'Lakshmi Devi', mobile: '9876543211',
    category: 'Electricity', location: 'Ward 5, Nehru Street', title: 'Street lights not working',
    description: 'Five street lights on Nehru Street have been non-functional for 2 weeks.',
    image: null, status: 'In Progress', date: '2024-11-03', resolvedDate: null,
    officerRemark: 'Electrician team dispatched. Replacement parts ordered.',
    assignedOfficer: 'Electricity Officer', priority: 'Medium', remarks: []
  },
  {
    id: 'GRV-2024-0003', citizenId: 'CIT003', citizenName: 'Suresh Babu', mobile: '9876543212',
    category: 'Roads', location: 'Ward 7, RTC Colony', title: 'Large pothole on main road',
    description: 'A large pothole near RTC bus stop has caused two accidents already.',
    image: null, status: 'Pending', date: '2024-11-05', resolvedDate: null,
    officerRemark: '', assignedOfficer: 'Roads Officer', priority: 'High', remarks: []
  }
];

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 * @body    { category, location, title, description, date }
 */
async function createComplaint(req, res, next) {
  try {
    const { category, location, title, description, date } = req.body;
    const user = req.user;

    if (!category || !location || !title || !description) {
      return errorResponse(res, 400, 'Category, location, title and description are required.');
    }

    if (!config.complaintCategories.includes(category)) {
      return errorResponse(res, 400, `Invalid category. Must be one of: ${config.complaintCategories.join(', ')}`);
    }

    const assignedOfficer = config.categoryOfficerMap[category] || 'Roads Officer';

    const newComplaint = {
      id: generateComplaintId(complaints.length),
      citizenId: user.id,
      citizenName: user.name,
      mobile: user.mobile || '',
      category,
      location,
      title,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'Pending',
      date: date || new Date().toISOString().split('T')[0],
      resolvedDate: null,
      officerRemark: '',
      assignedOfficer,
      priority: 'Medium',
      remarks: []
    };

    complaints.unshift(newComplaint);

    return successResponse(res, 201, 'Complaint registered successfully', newComplaint);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get all complaints (with optional filters)
 * @route   GET /api/complaints
 * @access  Private (Officer - sees own category, Citizen - sees own complaints)
 * @query   status, category, search, page, limit
 */
async function getComplaints(req, res, next) {
  try {
    const user = req.user;
    let result = [...complaints];

    // Role-based scoping
    if (user.role === 'citizen') {
      result = result.filter(c => c.citizenId === user.id);
    } else if (user.role === 'officer') {
      result = result.filter(c => c.assignedOfficer === user.department);
    }

    // Filters
    const { status, category, search } = req.query;

    if (status && status !== 'all') {
      result = result.filter(c => c.status.toLowerCase().replace(/\s/g, '') === status.toLowerCase().replace(/\s/g, ''));
    }
    if (category && category !== 'all') {
      result = result.filter(c => c.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q)
      );
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || result.length || 1;
    const startIdx = (page - 1) * limit;
    const paginated = result.slice(startIdx, startIdx + limit);

    return successResponse(res, 200, 'Complaints fetched', {
      complaints: paginated,
      total: result.length,
      page,
      totalPages: Math.ceil(result.length / limit) || 1
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Private
 */
async function getComplaintById(req, res, next) {
  try {
    const complaint = complaints.find(c => c.id === req.params.id.toUpperCase());
    if (!complaint) return errorResponse(res, 404, 'Complaint not found.');

    const user = req.user;
    // Citizens can only view their own complaints
    if (user.role === 'citizen' && complaint.citizenId !== user.id) {
      return errorResponse(res, 403, 'Access denied. This complaint does not belong to you.');
    }
    // Officers can only view complaints in their department
    if (user.role === 'officer' && complaint.assignedOfficer !== user.department) {
      return errorResponse(res, 403, 'Access denied. This complaint is not assigned to your department.');
    }

    return successResponse(res, 200, 'Complaint fetched', complaint);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Track a complaint by ID (public — no auth required)
 * @route   GET /api/complaints/track/:id
 * @access  Public
 */
async function trackComplaint(req, res, next) {
  try {
    const complaint = complaints.find(c => c.id === req.params.id.toUpperCase());
    if (!complaint) return errorResponse(res, 404, 'Complaint not found. Please check the ID and try again.');

    // Return limited public info (no citizen contact details)
    const { mobile, citizenId, remarks, ...publicData } = complaint;

    return successResponse(res, 200, 'Complaint found', publicData);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update complaint status (Mark In Progress / Resolved)
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Officer only)
 * @body    { status }
 */
async function updateComplaintStatus(req, res, next) {
  try {
    const { status } = req.body;
    const user = req.user;

    if (!config.complaintStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${config.complaintStatuses.join(', ')}`);
    }

    const complaint = complaints.find(c => c.id === req.params.id.toUpperCase());
    if (!complaint) return errorResponse(res, 404, 'Complaint not found.');

    if (complaint.assignedOfficer !== user.department) {
      return errorResponse(res, 403, 'Access denied. This complaint is not assigned to your department.');
    }

    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedDate = new Date().toISOString().split('T')[0];
    } else {
      complaint.resolvedDate = null;
    }

    return successResponse(res, 200, `Complaint marked as ${status}`, complaint);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Add a remark/note to a complaint
 * @route   POST /api/complaints/:id/remarks
 * @access  Private (Officer only)
 * @body    { remark }
 */
async function addRemark(req, res, next) {
  try {
    const { remark } = req.body;
    const user = req.user;

    if (!remark || !remark.trim()) {
      return errorResponse(res, 400, 'Remark text is required.');
    }

    const complaint = complaints.find(c => c.id === req.params.id.toUpperCase());
    if (!complaint) return errorResponse(res, 404, 'Complaint not found.');

    if (complaint.assignedOfficer !== user.department) {
      return errorResponse(res, 403, 'Access denied. This complaint is not assigned to your department.');
    }

    const newRemark = {
      id: generateRemarkId(),
      text: remark.trim(),
      officerName: user.name,
      date: new Date().toISOString()
    };

    complaint.remarks = complaint.remarks || [];
    complaint.remarks.unshift(newRemark);
    complaint.officerRemark = remark.trim(); // keep latest remark for quick display

    return successResponse(res, 200, 'Remark added successfully', complaint);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get dashboard statistics (role-aware)
 * @route   GET /api/complaints/stats
 * @access  Private
 */
async function getStats(req, res, next) {
  try {
    const user = req.user;
    let scoped = [...complaints];

    if (user.role === 'citizen') {
      scoped = scoped.filter(c => c.citizenId === user.id);
    } else if (user.role === 'officer') {
      scoped = scoped.filter(c => c.assignedOfficer === user.department);
    }

    const stats = {
      total: scoped.length,
      pending: scoped.filter(c => c.status === 'Pending').length,
      inProgress: scoped.filter(c => c.status === 'In Progress').length,
      resolved: scoped.filter(c => c.status === 'Resolved').length
    };

    return successResponse(res, 200, 'Stats fetched', stats);
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get category-wise complaint breakdown (for reports/charts)
 * @route   GET /api/complaints/reports/category
 * @access  Private (Officer)
 */
async function getCategoryReport(req, res, next) {
  try {
    const breakdown = config.complaintCategories.map(cat => {
      const list = complaints.filter(c => c.category === cat);
      return {
        category: cat,
        total: list.length,
        pending: list.filter(c => c.status === 'Pending').length,
        inProgress: list.filter(c => c.status === 'In Progress').length,
        resolved: list.filter(c => c.status === 'Resolved').length
      };
    });

    return successResponse(res, 200, 'Category report fetched', breakdown);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  trackComplaint,
  updateComplaintStatus,
  addRemark,
  getStats,
  getCategoryReport,
  __complaints: complaints
};
