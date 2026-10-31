const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  getProducts,
  getProductById,
  lookupProductByCode,
  createProduct,
  getProductQRCode,
  getProductBarcode,
  createStockMovement,
  getStockMovements,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

// Warehouses
router.get('/warehouses', checkPermission('inventory:view'), getWarehouses);
router.post('/warehouses', checkPermission('inventory:create'), createWarehouse);

// Products & Barcode/QR
router.get('/products', checkPermission('inventory:view'), getProducts);
router.get('/products/lookup/:code', checkPermission('inventory:view'), lookupProductByCode);
router.get('/products/:id', checkPermission('inventory:view'), getProductById);
router.post('/products', checkPermission('inventory:create'), createProduct);
router.get('/products/:id/qrcode', checkPermission('inventory:view'), getProductQRCode);
router.get('/products/:id/barcode', checkPermission('inventory:view'), getProductBarcode);

// Stock Movements (In, Out, Transfer, Adjust)
router.post('/movements', checkPermission('inventory:create'), createStockMovement);
router.get('/movements', checkPermission('inventory:view'), getStockMovements);

module.exports = router;
