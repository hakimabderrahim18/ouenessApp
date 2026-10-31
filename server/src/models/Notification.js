const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true },
    },
    message: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true },
    },
    category: {
      type: String,
      enum: ['WARNING', 'ANNOUNCEMENT', 'RECOMMENDATION', 'ORGANIZATIONAL'],
      default: 'WARNING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    targetType: {
      type: String,
      enum: ['ALL', 'ROLE', 'USER'],
      default: 'ALL',
    },
    targetRole: {
      type: String,
      default: null,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

module.exports = mongoose.model('Notification', notificationSchema);
