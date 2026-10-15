/* ============================================
   CONFIG.JS — Central App Configuration
   Smart Citizen Grievance Management System
   ============================================ */

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'smart_grievance_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5500'
  },

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_grievance_db'
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
  },

  // Complaint categories and their default assigned officer department
  categoryOfficerMap: {
    'Water Supply':  'Water Officer',
    'Electricity':   'Electricity Officer',
    'Roads':         'Roads Officer',
    'Drainage':      'Sanitation Officer',
    'Sanitation':    'Sanitation Officer',
    'Street Lights': 'Electricity Officer',
    'Public Health': 'Health Officer',
    'Others':        'Roads Officer'
  },

  complaintCategories: [
    'Water Supply', 'Electricity', 'Roads', 'Drainage',
    'Sanitation', 'Street Lights', 'Public Health', 'Others'
  ],

  complaintStatuses: ['Pending', 'In Progress', 'Resolved'],

  priorities: ['Low', 'Medium', 'High']
};
