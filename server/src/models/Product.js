const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true, trim: true },
      fr: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['fuel', 'lubricants', 'gas_cylinders', 'equipment', 'chemicals'],
      required: true,
      index: true,
    },
    unit: {
      type: String,
      enum: ['liter', 'barrel', 'cylinder', 'ton', 'unit'],
      default: 'liter',
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 5000,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 50000,
      min: 1,
    },
    unitPriceDZD: {
      type: Number,
      default: 0,
    },
    hazardClass: {
      type: String,
      default: 'Class 3 - Flammable Liquids (ADR)',
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    barcodeData: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining percentage
productSchema.virtual('stockPercentage').get(function () {
  if (!this.maxCapacity || this.maxCapacity === 0) return 0;
  return Math.min(100, Math.round((this.quantity / this.maxCapacity) * 100));
});

// Virtual for stock status (ok, warning, critical)
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'OUT_OF_STOCK';
  if (this.quantity <= this.minThreshold) return 'LOW_STOCK';
  if (this.stockPercentage < 40) return 'WARNING';
  return 'OPTIMAL';
});

module.exports = mongoose.model('Product', productSchema);
