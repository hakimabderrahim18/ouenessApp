const express = require('express');
const router = express.Router();
const {
  getUsers,
  getSeniorManagement,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getEmployeePerformance,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

// Organization structure & senior management (viewable by authenticated users)
router.get('/senior-management', getSeniorManagement);
router.get('/performance', checkPermission('users:view'), getEmployeePerformance);

// General User management
router.get('/', checkPermission('users:view'), getUsers);
router.get('/:id', checkPermission('users:view'), getUserById);
router.post('/', checkPermission('users:create'), createUser);
router.put('/:id', checkPermission('users:edit'), updateUser);
router.delete('/:id', checkPermission('users:delete'), deleteUser);

module.exports = router;
