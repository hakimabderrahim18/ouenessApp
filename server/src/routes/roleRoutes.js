const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('roles:view'), getRoles);
router.get('/:id', checkPermission('roles:view'), getRoleById);
router.post('/', checkPermission('roles:create'), createRole);
router.put('/:id', checkPermission('roles:edit'), updateRole);
router.delete('/:id', checkPermission('roles:delete'), deleteRole);

module.exports = router;
