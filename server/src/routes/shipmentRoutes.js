const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  getTrackingMapData,
  getRouteOptimizationPreview,
  toggleSimulator,
} = require('../controllers/shipmentController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

// Shipments CRUD & Status
router.get('/', checkPermission('shipments:view'), getShipments);
router.get('/map-data', checkPermission('tracking:view'), getTrackingMapData);
router.post('/optimize-route', checkPermission('shipments:view'), getRouteOptimizationPreview);
router.post('/simulator', checkPermission('tracking:edit'), toggleSimulator);
router.get('/:id', checkPermission('shipments:view'), getShipmentById);
router.post('/', checkPermission('shipments:create'), createShipment);
router.put('/:id/status', checkPermission('shipments:edit'), updateShipmentStatus);

module.exports = router;
