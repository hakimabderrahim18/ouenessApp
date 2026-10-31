const express = require('express');
const router = express.Router();
const { getAuditLogs, getDailyTimeline } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('audit:view'), getAuditLogs);
router.get('/timeline', checkPermission('audit:view'), getDailyTimeline);

module.exports = router;
