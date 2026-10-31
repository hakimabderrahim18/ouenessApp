const User = require('../models/User');
const Role = require('../models/Role');
const { logAudit } = require('../services/auditService');

// Get all users / employees with filters & pagination
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, department, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { 'fullName.ar': new RegExp(search, 'i') },
        { 'fullName.latin': new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { professionalId: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (department) {
      filter.$or = [
        { 'department.ar': new RegExp(department, 'i') },
        { 'department.fr': new RegExp(department, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .populate('role')
      .populate('warehouse')
      .sort({ seniorityRank: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: users,
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

// Get Senior Management / Hierarchy organigram data
const getSeniorManagement = async (req, res, next) => {
  try {
    const managers = await User.find({
      $or: [{ isSeniorManagement: true }, { seniorityRank: { $lt: 10 } }],
    })
      .populate('role')
      .sort({ seniorityRank: 1 });

    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role')
      .populate('warehouse');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الموظف / المستخدم غير موجود.',
          fr: 'Utilisateur introuvable.',
          en: 'User not found.',
        },
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Create new user / employee
const createUser = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      professionalId,
      dateOfBirth,
      phone,
      photo,
      role,
      jobTitle,
      department,
      status,
      warehouse,
      preferredLanguage,
      isSeniorManagement,
      seniorityRank,
    } = req.body;

    // Check unique email
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: {
          ar: 'البريد الإلكتروني مسجل بالفعل لموظف آخر.',
          fr: 'Cette adresse email est déjà enregistrée.',
          en: 'Email address is already registered.',
        },
      });
    }

    // Check unique professional ID
    const pidExists = await User.findOne({
      professionalId: professionalId.toUpperCase().trim(),
    });
    if (pidExists) {
      return res.status(409).json({
        success: false,
        message: {
          ar: 'الرقم المهني التعريفي (ID) مستخدم بالفعل.',
          fr: 'Le matricule professionnel existe déjà.',
          en: 'Professional ID already exists.',
        },
      });
    }

    // Verify role exists
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: {
          ar: 'الدور الوظيفي المحدد غير موجود.',
          fr: 'Le rôle spécifié est introuvable.',
          en: 'Specified role not found.',
        },
      });
    }

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: password || 'LogiNaft@2026',
      professionalId: professionalId.toUpperCase().trim(),
      dateOfBirth,
      phone,
      photo: photo || '',
      role: roleDoc._id,
      jobTitle: jobTitle || roleDoc.displayName,
      department: department || {
        ar: 'العمليات اللوجستية',
        fr: 'Opérations Logistiques',
        en: 'Logistics Operations',
      },
      status: status || 'active',
      warehouse: warehouse || null,
      preferredLanguage: preferredLanguage || 'ar',
      isSeniorManagement: isSeniorManagement || false,
      seniorityRank: seniorityRank || 99,
    });

    const populatedUser = await User.findById(newUser._id)
      .populate('role')
      .populate('warehouse');

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'USERS',
      targetId: newUser._id,
      targetModel: 'User',
      description: {
        ar: `إضافة موظف جديد (${newUser.fullName.ar}) بالرقم المهني (${newUser.professionalId})`,
        fr: `Création du collaborateur (${newUser.fullName.latin}) avec matricule (${newUser.professionalId})`,
        en: `Created new employee (${newUser.fullName.latin}) with ID (${newUser.professionalId})`,
      },
      changes: { before: null, after: populatedUser.toObject() },
    });

    return res.status(201).json({
      success: true,
      message: {
        ar: 'تم تسجيل الموظف الجديد بنجاح في المنصة.',
        fr: 'Collaborateur enregistré avec succès.',
        en: 'New employee registered successfully.',
      },
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Update user / employee
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الموظف غير موجود.',
          fr: 'Utilisateur introuvable.',
          en: 'User not found.',
        },
      });
    }

    const beforeState = user.toObject();

    const allowedUpdates = [
      'fullName',
      'email',
      'phone',
      'photo',
      'role',
      'jobTitle',
      'department',
      'status',
      'warehouse',
      'dateOfBirth',
      'preferredLanguage',
      'isSeniorManagement',
      'seniorityRank',
      'performanceScore',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Unlock user account if status explicitly changed to active
    if (req.body.unlockAccount) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    await user.save();
    const updatedUser = await User.findById(user._id)
      .populate('role')
      .populate('warehouse');

    await logAudit({
      user: req.user,
      action: 'UPDATE',
      module: 'USERS',
      targetId: user._id,
      targetModel: 'User',
      description: {
        ar: `تحديث بيانات الموظف (${user.fullName.ar})`,
        fr: `Mise à jour des informations du collaborateur (${user.fullName.latin})`,
        en: `Updated employee profile (${user.fullName.latin})`,
      },
      changes: { before: beforeState, after: updatedUser.toObject() },
    });

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم تحديث بيانات الموظف بنجاح.',
        fr: 'Données du collaborateur mises à jour avec succès.',
        en: 'Employee details updated successfully.',
      },
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الموظف غير موجود.',
          fr: 'Utilisateur introuvable.',
          en: 'User not found.',
        },
      });
    }

    if (user.isSeniorManagement && user.seniorityRank === 1) {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'لا يمكن حذف حساب المدير العام للمؤسسة.',
          fr: 'Impossible de supprimer le compte du Directeur Général.',
          en: 'General Manager account cannot be deleted.',
        },
      });
    }

    await User.findByIdAndDelete(user._id);

    await logAudit({
      user: req.user,
      action: 'DELETE',
      module: 'USERS',
      targetId: user._id,
      targetModel: 'User',
      description: {
        ar: `حذف حساب الموظف (${user.fullName.ar})`,
        fr: `Suppression du compte collaborateur (${user.fullName.latin})`,
        en: `Deleted employee account (${user.fullName.latin})`,
      },
      changes: { before: user.toObject(), after: null },
    });

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم حذف حساب الموظف بنجاح.',
        fr: 'Collaborateur supprimé avec succès.',
        en: 'Employee deleted successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Employee performance ranking & metrics
const getEmployeePerformance = async (req, res, next) => {
  try {
    const employees = await User.find({ status: 'active' })
      .populate('role')
      .sort({ performanceScore: -1, completedOperationsCount: -1 });

    const totalOps = employees.reduce((sum, e) => sum + (e.completedOperationsCount || 0), 0);
    const avgScore = employees.length
      ? Math.round(employees.reduce((sum, e) => sum + (e.performanceScore || 0), 0) / employees.length)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        employees,
        summary: {
          totalEmployees: employees.length,
          totalCompletedOperations: totalOps,
          averagePerformanceScore: avgScore,
          topPerformer: employees[0] || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getSeniorManagement,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getEmployeePerformance,
};
