const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    brand: {
      type: String,
      default: 'Mercedes-Benz Actros',
    },
    tankCapacityLiters: {
      type: Number,
      required: true,
      default: 35000,
    },
    tankType: {
      type: String,
      enum: ['FUEL_CISTERN', 'LPG_BULK', 'CYLINDER_CARRIER', 'FLATBED'],
      default: 'FUEL_CISTERN',
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'in_transit', 'loading', 'maintenance', 'idle'],
      default: 'available',
      index: true,
    },
    currentLocation: {
      lat: { type: Number, required: true, default: 36.7022 },
      lng: { type: Number, required: true, default: 3.1258 },
      speedKmH: { type: Number, default: 0 },
      headingDeg: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    adrCertified: {
      type: Boolean,
      default: true, // ADR Hazardous materials transportation
    },
    mileageKm: {
      type: Number,
      default: 124500,
    },
    fuelLevelPercentage: {
      type: Number,
      default: 85,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Truck', truckSchema);
