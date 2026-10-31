const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['DELIVERY_NOTE', 'INVOICE', 'RECEIPT_PV', 'INVENTORY_REPORT', 'TRANSPORT_ORDER', 'PACKING_LIST'],
      required: true,
      index: true,
    },
    title: {
      ar: String,
      fr: String,
      en: String,
    },
    referenceEntity: {
      entityType: { type: String, enum: ['Shipment', 'Product', 'Warehouse', 'Report'] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    language: {
      type: String,
      enum: ['ar', 'fr', 'en'],
      default: 'ar',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    signatories: {
      generalManager: { type: String, default: 'RAHMOUNI OUNES (رحموني وناس)' },
      operationsManager: { type: String, default: 'GOURRARI YOUCEF (قوراري يوسف)' },
    },
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

module.exports = mongoose.model('Document', documentSchema);
