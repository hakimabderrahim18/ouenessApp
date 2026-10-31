const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'liter' },
      },
    ],
    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    destination: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, default: '' },
      location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'LOADING', 'IN_TRANSIT', 'ARRIVED', 'DELAYED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    currentLocation: {
      lat: { type: Number, default: 36.7022 },
      lng: { type: Number, default: 3.1258 },
      speedKmH: { type: Number, default: 0 },
      headingDeg: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    routeWaypoints: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    ],
    optimizedRoute: {
      distanceKm: { type: Number, default: 0 },
      estimatedDurationMinutes: { type: Number, default: 0 },
      estimatedFuelCostDZD: { type: Number, default: 0 },
      routeGeometry: [{ lat: Number, lng: Number }],
    },
    dispatchTime: {
      type: Date,
      default: null,
    },
    estimatedArrivalTime: {
      type: Date,
      required: true,
      index: true,
    },
    actualArrivalTime: {
      type: Date,
      default: null,
    },
    telemetry: {
      tankTemperatureC: { type: Number, default: 22.5 },
      tankPressureBar: { type: Number, default: 1.05 },
      sealIntact: { type: Boolean, default: true },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String, default: '' },
        location: { lat: Number, lng: Number },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: check if shipment is delayed
shipmentSchema.virtual('isDelayed').get(function () {
  if (['ARRIVED', 'CANCELLED'].includes(this.status)) return false;
  return new Date() > new Date(this.estimatedArrivalTime);
});

module.exports = mongoose.model('Shipment', shipmentSchema);
