/* ============================================
   NOTICE.JS — Notice Board Mongoose Model
   ============================================ */

const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Notice text is required'],
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    isNew: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

noticeSchema.index({ date: -1 });

noticeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Notice', noticeSchema);
