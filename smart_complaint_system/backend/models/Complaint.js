/* ============================================
   COMPLAINT.JS — Complaint Mongoose Model
   ============================================ */

const mongoose = require('mongoose');
const config = require('../config/config');

// ---- Sub-schema: Officer Remark ----
const remarkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },
    officerName: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

// ---- Main Complaint Schema ----
const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true
      // e.g. GRV-2024-0001
    },
    citizenId: {
      type: String,
      required: true,
      trim: true
      // references Citizen.citizenId
    },
    citizenName: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: config.complaintCategories,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true
    },
    image: {
      type: String,
      default: null
      // stores relative path e.g. /uploads/complaint-xxx.jpg
    },
    status: {
      type: String,
      enum: config.complaintStatuses,
      default: 'Pending'
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
      // date complaint was filed
    },
    resolvedDate: {
      type: Date,
      default: null
    },
    officerRemark: {
      type: String,
      trim: true,
      default: ''
      // latest remark, for quick display
    },
    assignedOfficer: {
      type: String,
      required: true,
      trim: true
      // department name, e.g. "Water Officer"
    },
    priority: {
      type: String,
      enum: config.priorities,
      default: 'Medium'
    },
    remarks: {
      type: [remarkSchema],
      default: []
    }
  },
  { timestamps: true }
);

// ---- Indexes for fast lookups & filters ----
complaintSchema.index({ citizenId: 1 });
complaintSchema.index({ assignedOfficer: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });

// ---- Auto-set resolvedDate when status changes to Resolved ----
complaintSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Resolved' && !this.resolvedDate) {
      this.resolvedDate = new Date();
    }
    if (this.status !== 'Resolved') {
      this.resolvedDate = null;
    }
  }
  next();
});

complaintSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
