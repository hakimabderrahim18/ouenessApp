const Notification = require('../models/Notification');
const { emitNotification } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

// Get user notifications with unread count
const getNotifications = async (req, res, next) => {
  try {
    const { category, unreadOnly, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role?.name || req.user.role;

    const filter = {
      $or: [
        { targetType: 'ALL' },
        { targetType: 'ROLE', targetRole: userRole },
        { targetType: 'USER', targetUser: userId },
      ],
    };

    if (category) filter.category = category;
    if (unreadOnly === 'true') {
      filter['readBy.userId'] = { $ne: userId };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      'readBy.userId': { $ne: userId },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: { userId, readAt: new Date() } },
    });

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role?.name || req.user.role;

    const filter = {
      $or: [
        { targetType: 'ALL' },
        { targetType: 'ROLE', targetRole: userRole },
        { targetType: 'USER', targetUser: userId },
      ],
      'readBy.userId': { $ne: userId },
    };

    await Notification.updateMany(filter, {
      $addToSet: { readBy: { userId, readAt: new Date() } },
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Admin publish announcement to all or specific roles
const publishAnnouncement = async (req, res, next) => {
  try {
    const { title, message, category, priority, targetType, targetRole } = req.body;

    const notification = await emitNotification(req.app, {
      title,
      message,
      category: category || 'ANNOUNCEMENT',
      priority: priority || 'NORMAL',
      targetType: targetType || 'ALL',
      targetRole: targetRole || null,
      timestamp: new Date(),
    });

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'SETTINGS',
      targetId: notification._id,
      targetModel: 'Notification',
      description: {
        ar: `نشر إشعار إداري رسمي: (${title.ar})`,
        fr: `Publication d'une annonce officielle: (${title.fr})`,
        en: `Published official announcement: (${title.en})`,
      },
    });

    return res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  publishAnnouncement,
};
