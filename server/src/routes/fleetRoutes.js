const express = require('express');
const router = express.Router();
const { getTrucks, createTruck, updateTruck } = require('../controllers/fleetController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('fleet:view'), getTrucks);
router.post('/', checkPermission('fleet:create'), createTruck);
router.put('/:id', checkPermission('fleet:edit'), updateTruck);

module.exports = router;
