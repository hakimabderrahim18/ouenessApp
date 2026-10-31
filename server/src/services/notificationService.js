const Notification = require('../models/Notification');

const emitNotification = async (app, notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    const io = app.get('io');

    if (io) {
      if (notification.targetType === 'ALL') {
        io.emit('new_notification', notification);
      } else if (notification.targetType === 'ROLE' && notification.targetRole) {
        io.to(`role_${notification.targetRole}`).emit('new_notification', notification);
      } else if (notification.targetType === 'USER' && notification.targetUser) {
        io.to(`user_${notification.targetUser}`).emit('new_notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
  }
};

module.exports = {
  emitNotification,
};
