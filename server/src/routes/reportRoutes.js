const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getReports,
  createManualReport,
  exportReportAsPDF,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/', checkPermission('reports:view'), getReports);
router.post('/generate', checkPermission('reports:create'), createManualReport);
router.get('/:id/pdf', checkPermission('reports:export'), exportReportAsPDF);

module.exports = router;
