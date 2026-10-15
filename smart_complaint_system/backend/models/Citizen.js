/* ============================================
   CITIZEN.JS — Citizen Mongoose Model
   ============================================ */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const citizenSchema = new mongoose.Schema(
  {
    citizenId: {
      type: String,
      required: true,
      unique: true,
      trim: true
      // e.g. CIT001
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits']
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
      select: false // exclude from query results by default
    },
    ward: {
      type: String,
      required: [true, 'Ward is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    aadhaar: {
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
citizenSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Instance method to compare passwords ----
citizenSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- Hide sensitive fields when converting to JSON ----
citizenSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Citizen', citizenSchema);
