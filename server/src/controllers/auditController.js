const AuditLog = require('../models/AuditLog');

// Get audit logs with filters (user, module, action, date range)
const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, performedBy, startDate, endDate, search, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (module) filter.module = module;
    if (action) filter.action = action;
    if (performedBy) filter.performedBy = performedBy;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { performedByName: new RegExp(search, 'i') },
        { targetId: new RegExp(search, 'i') },
        { targetModel: new RegExp(search, 'i') },
        { 'description.ar': new RegExp(search, 'i') },
        { 'description.fr': new RegExp(search, 'i') },
        { 'description.en': new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'fullName email professionalId photo')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: logs,
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

// Daily timeline / chronological operational history
const getDailyTimeline = async (req, res, next) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    };

    if (req.query.module) filter.module = req.query.module;

    const timeline = await AuditLog.find(filter)
      .populate('performedBy', 'fullName email professionalId')
      .sort({ timestamp: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      count: timeline.length,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getDailyTimeline,
};
