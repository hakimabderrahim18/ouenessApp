const express = require('express');
const router = express.Router();
const {
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  getLoginLogs,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public auth routes
router.post('/login', loginLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected auth routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin-only security login attempts log
router.get('/login-logs', protect, checkPermission('settings:view'), getLoginLogs);

module.exports = router;
