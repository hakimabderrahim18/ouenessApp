const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    performedByName: {
      type: String,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'SYSTEM',
    },
    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'STATUS_CHANGE',
        'STOCK_IN',
        'STOCK_OUT',
        'STOCK_TRANSFER',
        'SHIPMENT_DISPATCH',
        'SHIPMENT_DELIVERED',
        'ROUTE_OPTIMIZE',
        'REPORT_GENERATE',
        'PDF_EXPORT',
      ],
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: [
        'AUTH',
        'USERS',
        'ROLES',
        'INVENTORY',
        'SHIPMENTS',
        'FLEET',
        'TRACKING',
        'DOCUMENTS',
        'REPORTS',
        'AUDIT',
        'SETTINGS',
        'AI_ASSISTANT',
      ],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    targetModel: {
      type: String,
      default: '',
    },
    description: {
      ar: { type: String, default: '' },
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null },
      after: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We rely strictly on immutable timestamp
  }
);

// Prevent mutations to guarantee audit immutability
auditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are immutable and cannot be updated.');
});
auditLogSchema.pre('updateMany', function () {
  throw new Error('Audit logs are immutable and cannot be updated.');
});
auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit logs are immutable and cannot be updated.');
});
auditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs are immutable and cannot be deleted.');
});
auditLogSchema.pre('deleteMany', function () {
  throw new Error('Audit logs are immutable and cannot be deleted.');
});
auditLogSchema.pre('findOneAndDelete', function () {
  throw new Error('Audit logs are immutable and cannot be deleted.');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
