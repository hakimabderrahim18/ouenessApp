const express = require('express');
const router = express.Router();
const { getDocuments, generateAndDownloadPDF } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('documents:view'), getDocuments);
router.post('/generate', checkPermission('documents:create'), generateAndDownloadPDF);

module.exports = router;
