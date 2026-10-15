/* ============================================
   UPLOAD MIDDLEWARE.JS — Multer Image Upload Config
   ============================================ */

const multer = require('multer');
const path = require('path');
const config = require('../config/config');

// Ensure upload directory exists


// ---- Storage Configuration ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `complaint-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// ---- File Filter (images only) ----
function fileFilter(req, file, cb) {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP and GIF images are allowed.'), false);
  }
}

// ---- Multer Instance ----
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize }
});

module.exports = upload;
