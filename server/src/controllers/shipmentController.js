const Shipment = require('../models/Shipment');
const Truck = require('../models/Truck');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const User = require('../models/User');
const { optimizeRoute } = require('../services/routeOptimizationService');
const { logAudit } = require('../services/auditService');
const { emitNotification } = require('../services/notificationService');
const { startGpsSimulator, stopGpsSimulator, getSimulatorStatus } = require('../services/gpsSimulatorService');

// Get all shipments with filters
const getShipments = async (req, res, next) => {
  try {
    const { status, origin, search, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (origin) filter.originWarehouse = origin;
    if (search) {
      filter.$or = [
        { reference: new RegExp(search, 'i') },
        { 'destination.city': new RegExp(search, 'i') },
        { 'destination.name': new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const shipments = await Shipment.find(filter)
      .populate('originWarehouse', 'name city code location')
      .populate('truck', 'plateNumber code brand tankCapacityLiters status')
      .populate('driver', 'fullName phone email professionalId')
      .populate('products.product', 'name sku unit category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shipment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: shipments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getShipmentById = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('originWarehouse')
      .populate('truck')
      .populate('driver')
      .populate('products.product')
      .populate('statusHistory.updatedBy', 'fullName professionalId');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الشحنة المطلوبة غير موجودة.',
          fr: 'Expédition introuvable.',
          en: 'Shipment not found.',
        },
      });
    }

    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// Create new shipment with route optimization
const createShipment = async (req, res, next) => {
  try {
    const {
      originWarehouseId,
      destination,
      truckId,
      driverId,
      products,
      estimatedArrivalTime,
    } = req.body;

    const originWh = await Warehouse.findById(originWarehouseId);
    if (!originWh) {
      return res.status(400).json({
        success: false,
        message: { ar: 'مستودع الانطلاق غير موجود.', fr: 'Entrepôt d\'origine introuvable.', en: 'Origin warehouse not found.' },
      });
    }

    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(400).json({
        success: false,
        message: { ar: 'الشاحنة المحددة غير موجودة.', fr: 'Camion citerne introuvable.', en: 'Truck not found.' },
      });
    }

    const ref = `SHP-DZ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Calculate Route Optimization between origin and destination
    const routeResult = await optimizeRoute(originWh.location, destination.location);

    const newShipment = await Shipment.create({
      reference: ref,
      products,
      originWarehouse: originWh._id,
      destination,
      truck: truck._id,
      driver: driverId,
      status: 'PENDING',
      currentLocation: {
        lat: originWh.location.lat,
        lng: originWh.location.lng,
        speedKmH: 0,
        headingDeg: 0,
        lastUpdated: new Date(),
      },
      routeWaypoints: routeResult.optimized.waypoints,
      optimizedRoute: {
        distanceKm: routeResult.optimized.distanceKm,
        estimatedDurationMinutes: routeResult.optimized.durationMinutes,
        estimatedFuelCostDZD: routeResult.optimized.fuelCostDZD,
        routeGeometry: routeResult.optimized.waypoints,
      },
      estimatedArrivalTime: new Date(estimatedArrivalTime || Date.now() + routeResult.optimized.durationMinutes * 60 * 1000),
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          updatedBy: req.user._id,
          notes: 'إنشاء أمر الشحن والنقل اللوجستي',
          location: originWh.location,
        },
      ],
    });

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'SHIPMENTS',
      targetId: newShipment._id,
      targetModel: 'Shipment',
      description: {
        ar: `إنشاء شحنة طاقة جديدة (${newShipment.reference}) من (${originWh.name.ar}) إلى (${destination.city})`,
        fr: `Nouvelle expédition (${newShipment.reference}) de (${originWh.name.fr}) vers (${destination.city})`,
        en: `Created new shipment (${newShipment.reference}) from (${originWh.name.en}) to (${destination.city})`,
      },
    });

    return res.status(201).json({
      success: true,
      data: newShipment,
      optimization: routeResult,
    });
  } catch (error) {
    next(error);
  }
};

// Update shipment status
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const shipment = await Shipment.findById(req.params.id)
      .populate('truck')
      .populate('driver')
      .populate('originWarehouse');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: { ar: 'الشحنة غير موجودة.', fr: 'Expédition introuvable.', en: 'Shipment not found.' },
      });
    }

    const previousStatus = shipment.status;
    shipment.status = status;

    if (status === 'IN_TRANSIT' && !shipment.dispatchTime) {
      shipment.dispatchTime = new Date();
      if (shipment.truck) {
        await Truck.findByIdAndUpdate(shipment.truck._id, { status: 'in_transit' });
      }
    } else if (status === 'ARRIVED') {
      shipment.actualArrivalTime = new Date();
      if (shipment.truck) {
        await Truck.findByIdAndUpdate(shipment.truck._id, { status: 'available' });
      }
      if (shipment.driver) {
        await User.findByIdAndUpdate(shipment.driver._id, {
          $inc: { completedOperationsCount: 1 },
        });
      }
    }

    shipment.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: notes || `تحديث حالة الشحنة إلى (${status})`,
      location: shipment.currentLocation,
    });

    await shipment.save();

    await logAudit({
      user: req.user,
      action: status === 'IN_TRANSIT' ? 'SHIPMENT_DISPATCH' : status === 'ARRIVED' ? 'SHIPMENT_DELIVERED' : 'STATUS_CHANGE',
      module: 'SHIPMENTS',
      targetId: shipment._id,
      targetModel: 'Shipment',
      description: {
        ar: `تغيير حالة الشحنة (${shipment.reference}) من (${previousStatus}) إلى (${status})`,
        fr: `Statut de l'expédition (${shipment.reference}) changé de (${previousStatus}) à (${status})`,
        en: `Shipment (${shipment.reference}) status changed from (${previousStatus}) to (${status})`,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('shipment_status_changed', shipment);
    }

    return res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

// Aggregated data for Interactive Leaflet Map (Warehouses, Active Shipments, Trucks)
const getTrackingMapData = async (req, res, next) => {
  try {
    const [warehouses, activeShipments, trucks] = await Promise.all([
      Warehouse.find({ status: 'active' }),
      Shipment.find({ status: { $in: ['IN_TRANSIT', 'DELAYED', 'LOADING'] } })
        .populate('truck', 'plateNumber code brand tankCapacityLiters')
        .populate('driver', 'fullName phone')
        .populate('originWarehouse', 'name city location code')
        .populate('products.product', 'name sku category'),
      Truck.find(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        warehouses,
        shipments: activeShipments,
        trucks,
        simulatorStatus: getSimulatorStatus(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Route Optimization API endpoint (compare standard vs optimized)
const getRouteOptimizationPreview = async (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'Origin and destination are required' });
    }

    const result = await optimizeRoute(origin, destination);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Simulator control
const toggleSimulator = (req, res) => {
  const { action } = req.body;
  if (action === 'start') {
    startGpsSimulator(req.app);
    return res.status(200).json({ success: true, message: 'GPS Simulator Started', status: getSimulatorStatus() });
  } else {
    stopGpsSimulator();
    return res.status(200).json({ success: true, message: 'GPS Simulator Stopped', status: getSimulatorStatus() });
  }
};

module.exports = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  getTrackingMapData,
  getRouteOptimizationPreview,
  toggleSimulator,
};
