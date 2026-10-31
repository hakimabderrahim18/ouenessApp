const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  req,
  user,
  action,
  module,
  targetId = '',
  targetModel = '',
  description = { ar: '', fr: '', en: '' },
  changes = { before: null, after: null },
}) => {
  try {
    const performedUser = user || (req && req.user);
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1') : '127.0.0.1';

    await AuditLog.create({
      performedBy: performedUser ? performedUser._id : null,
      performedByName: performedUser
        ? (performedUser.fullName?.latin || performedUser.fullName?.ar || performedUser.email)
        : 'System',
      userRole: performedUser?.role?.name || performedUser?.role || 'SYSTEM',
      action,
      module,
      targetId: targetId ? targetId.toString() : '',
      targetModel,
      description,
      changes,
      ipAddress: ip,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAudit };
