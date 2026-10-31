const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'LOCKED'],
      required: true,
    },
    failureReason: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Desktop',
    },
    location: {
      type: String,
      default: 'Algeria (DZ)',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
