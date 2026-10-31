const Role = require('../models/Role');
const { logAudit } = require('../services/auditService');

// System permission definitions with multilingual labels
const AVAILABLE_PERMISSIONS = [
  { module: 'users', label: { ar: 'إدارة المستخدمين والموظفين', fr: 'Gestion des Utilisateurs', en: 'User Management' }, actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'roles', label: { ar: 'الأدوار والصلاحيات (RBAC)', fr: 'Rôles & Permissions (RBAC)', en: 'Roles & Permissions (RBAC)' }, actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'inventory', label: { ar: 'إدارة المخزون والمستودعات', fr: 'Gestion des Stocks & Entrepôts', en: 'Inventory & Warehouses' }, actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'shipments', label: { ar: 'إدارة الشحنات والتوزيع', fr: 'Gestion des Expéditions & Distribution', en: 'Shipments & Distribution' }, actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'fleet', label: { ar: 'إدارة أسطول الشاحنات والسائقين', fr: 'Gestion de la Flotte & Chauffeurs', en: 'Fleet & Drivers' }, actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'tracking', label: { ar: 'التتبع الجغرافي المباشر (GPS)', fr: 'Localisation & Suivi Direct', en: 'Live GPS Tracking' }, actions: ['view', 'edit'] },
  { module: 'documents', label: { ar: 'إصدار وطباعة وثائق PDF', fr: 'Documents Officiels PDF', en: 'Official PDF Documents' }, actions: ['view', 'create', 'export'] },
  { module: 'reports', label: { ar: 'التقارير الإحصائية الذكية', fr: 'Rapports & Statistiques Intelligentes', en: 'Smart Reports & Analytics' }, actions: ['view', 'create', 'export'] },
  { module: 'audit', label: { ar: 'سجل تدقيق العمليات (Audit Log)', fr: 'Journal d\'Audit du Système', en: 'System Audit Logs' }, actions: ['view', 'export'] },
  { module: 'ai_assistant', label: { ar: 'المساعد الذكي (AI Assistant)', fr: 'Assistant Intelligent (IA)', en: 'AI Assistant' }, actions: ['view', 'create'] },
  { module: 'settings', label: { ar: 'إعدادات النظام والتهيئة', fr: 'Configuration & Paramètres', en: 'System Settings' }, actions: ['view', 'edit'] },
];

// Get all roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      data: roles,
      availablePermissions: AVAILABLE_PERMISSIONS,
    });
  } catch (error) {
    next(error);
  }
};

// Get single role
const getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الدور المطلوب غير موجود.',
          fr: 'Rôle introuvable.',
          en: 'Role not found.',
        },
      });
    }
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

// Create new custom role
const createRole = async (req, res, next) => {
  try {
    const { name, displayName, description, permissions, color } = req.body;

    const existing = await Role.findOne({ name: name.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: {
          ar: 'اسم الدور التعريفي موجود مسبقاً.',
          fr: 'Ce nom de rôle existe déjà.',
          en: 'Role identifier already exists.',
        },
      });
    }

    const role = await Role.create({
      name: name.toUpperCase().trim(),
      displayName,
      description,
      permissions: permissions || [],
      color: color || '#3b82f6',
      isSystem: false,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE',
      module: 'ROLES',
      targetId: role._id,
      targetModel: 'Role',
      description: {
        ar: `إنشاء دور وظيفي جديد (${role.displayName.ar})`,
        fr: `Création d'un nouveau rôle (${role.displayName.fr})`,
        en: `New role created (${role.displayName.en})`,
      },
      changes: { before: null, after: role.toObject() },
    });

    return res.status(201).json({
      success: true,
      message: {
        ar: 'تم إنشاء الدور الوظيفي بنجاح.',
        fr: 'Rôle créé avec succès.',
        en: 'Role created successfully.',
      },
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// Update role & permissions
const updateRole = async (req, res, next) => {
  try {
    const { displayName, description, permissions, color } = req.body;
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الدور المطلوب غير موجود.',
          fr: 'Rôle introuvable.',
          en: 'Role not found.',
        },
      });
    }

    const beforeState = role.toObject();

    if (displayName) role.displayName = displayName;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;
    if (color) role.color = color;

    await role.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE',
      module: 'ROLES',
      targetId: role._id,
      targetModel: 'Role',
      description: {
        ar: `تعديل صلاحيات الدور (${role.displayName.ar})`,
        fr: `Mise à jour des autorisations du rôle (${role.displayName.fr})`,
        en: `Role permissions updated (${role.displayName.en})`,
      },
      changes: { before: beforeState, after: role.toObject() },
    });

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم تحديث الدور والصلاحيات بنجاح.',
        fr: 'Rôle et permissions mis à jour avec succès.',
        en: 'Role and permissions updated successfully.',
      },
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

// Delete role
const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: {
          ar: 'الدور المطلوب غير موجود.',
          fr: 'Rôle introuvable.',
          en: 'Role not found.',
        },
      });
    }

    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'لا يمكن حذف الأدوار الافتراضية للنظام.',
          fr: 'Impossible de supprimer un rôle système par défaut.',
          en: 'System roles cannot be deleted.',
        },
      });
    }

    await Role.findByIdAndDelete(role._id);

    await logAudit({
      user: req.user,
      action: 'DELETE',
      module: 'ROLES',
      targetId: role._id,
      targetModel: 'Role',
      description: {
        ar: `حذف الدور الوظيفي (${role.displayName.ar})`,
        fr: `Suppression du rôle (${role.displayName.fr})`,
        en: `Deleted role (${role.displayName.en})`,
      },
      changes: { before: role.toObject(), after: null },
    });

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم حذف الدور بنجاح.',
        fr: 'Rôle supprimé avec succès.',
        en: 'Role deleted successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  AVAILABLE_PERMISSIONS,
};
