/* ============================================
   OFFICER.JS — Officer Mongoose Model
   ============================================ */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const officerSchema = new mongoose.Schema(
  {
    officerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
      // e.g. OFF001 (internal ID)
    },
    officerId: {
      type: String,
      required: [true, 'Officer ID is required'],
      unique: true,
      trim: true
      // e.g. WO-2024-001 (login ID)
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
      // e.g. "Water Officer" — matches Complaint.assignedOfficer
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: config.complaintCategories,
      trim: true
      // e.g. "Water Supply" — matches Complaint.category
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// ---- Hash password before saving ----
officerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Instance method to compare passwords ----
officerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- Hide sensitive fields when converting to JSON ----
officerSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Officer', officerSchema);
