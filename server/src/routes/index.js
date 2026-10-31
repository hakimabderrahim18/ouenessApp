const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const userRoutes = require('./userRoutes');
const auditRoutes = require('./auditRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const notificationRoutes = require('./notificationRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const fleetRoutes = require('./fleetRoutes');
const documentRoutes = require('./documentRoutes');
const aiAssistantRoutes = require('./aiAssistantRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/audit', auditRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/fleet', fleetRoutes);
router.use('/documents', documentRoutes);
router.use('/ai-assistant', aiAssistantRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'LogiNaft Smart System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    timezone: 'Africa/Algiers',
  });
});

module.exports = router;
