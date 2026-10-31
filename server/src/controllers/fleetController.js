const Truck = require('../models/Truck');
const { logAudit } = require('../services/auditService');

// Get all trucks
const getTrucks = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { plateNumber: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    const trucks = await Truck.find(filter).populate('assignedDriver', 'fullName phone professionalId');
    return res.status(200).json({ success: true, data: trucks });
  } catch (error) {
    next(error);
  }
};

const createTruck = async (req, res, next) => {
  try {
    const truck = await Truck.create(req.body);
    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'FLEET',
      targetId: truck._id,
      targetModel: 'Truck',
      description: {
        ar: `إضافة شاحنة صهريج جديدة للأسطول (${truck.plateNumber}) كود (${truck.code})`,
        fr: `Ajout d'un nouveau camion citerne (${truck.plateNumber}) code (${truck.code})`,
        en: `Added new tanker truck (${truck.plateNumber}) code (${truck.code})`,
      },
    });
    return res.status(201).json({ success: true, data: truck });
  } catch (error) {
    next(error);
  }
};

const updateTruck = async (req, res, next) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, data: truck });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrucks,
  createTruck,
  updateTruck,
};
