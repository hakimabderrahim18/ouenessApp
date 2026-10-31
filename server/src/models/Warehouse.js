const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true, trim: true },
      fr: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    type: {
      type: String,
      enum: ['REFINERY', 'CENTRAL_DEPOT', 'REGIONAL_DEPOT', 'DISTRIBUTION_CENTER'],
      default: 'REGIONAL_DEPOT',
    },
    totalCapacityLiters: {
      type: Number,
      default: 5000000, // 5M Liters
    },
    currentOccupancyLiters: {
      type: Number,
      default: 0,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    phone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
