/**
 * RBAC (Role-Based Access Control) Middleware
 * Checks granular permissions per module and action, e.g. 'inventory:create', 'shipments:export'
 */

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: {
          ar: 'غير مسجل الدخول.',
          fr: 'Non authentifié.',
          en: 'Unauthenticated.',
        },
      });
    }

    const userRole = req.user.role;
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'لا يوجد دور وظيفي مخصص لهذا الحساب.',
          fr: 'Aucun rôle assigné à cet utilisateur.',
          en: 'No role assigned to this account.',
        },
      });
    }

    // Super Admin / General Manager bypass
    if (
      userRole.name === 'ADMIN' ||
      userRole.name === 'GENERAL_MANAGER' ||
      (userRole.permissions && userRole.permissions.includes('*'))
    ) {
      return next();
    }

    const permissions = userRole.permissions || [];

    // Check module wildcard, e.g. 'inventory:*'
    const [module, action] = requiredPermission.split(':');
    const moduleWildcard = `${module}:*`;

    if (
      permissions.includes(requiredPermission) ||
      permissions.includes(moduleWildcard) ||
      permissions.includes('*')
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: {
        ar: `ليس لديك الصلاحية المطلوبة (${requiredPermission}) لتنفيذ هذه العملية.`,
        fr: `Vous n'avez pas l'autorisation requise (${requiredPermission}) pour cette opération.`,
        en: `You do not have the required permission (${requiredPermission}) to perform this action.`,
      },
    });
  };
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: {
          ar: 'غير مسجل الدخول.',
          fr: 'Non authentifié.',
          en: 'Unauthenticated.',
        },
      });
    }

    const roleName = req.user.role?.name || req.user.role;

    if (roleName === 'ADMIN' || allowedRoles.includes(roleName)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: {
        ar: 'هذا الإجراء مخصص لأدوار وظيفية أخرى فقط.',
        fr: 'Cette action est réservée à d\'autres rôles fonctionnels.',
        en: 'This action is restricted to other specific roles.',
      },
    });
  };
};

module.exports = {
  checkPermission,
  checkRole,
};
