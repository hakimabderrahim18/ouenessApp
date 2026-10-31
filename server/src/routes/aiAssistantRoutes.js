const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/aiAssistantController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.post('/chat', checkPermission('ai_assistant:view'), chatWithAssistant);

module.exports = router;
