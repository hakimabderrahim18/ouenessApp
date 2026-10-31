const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: {
        ar: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول أولاً.',
        fr: 'Accès non autorisé. Veuillez vous connecter d\'abord.',
        en: 'Access unauthorized. Please login first.',
      },
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'loginaft_access_secret_fallback'
    );

    const user = await User.findById(decoded.id).populate('role').populate('warehouse');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: {
          ar: 'المستخدم المرتبط بهذا الرمز لم يعد موجوداً.',
          fr: 'L\'utilisateur associé à ce jeton n\'existe plus.',
          en: 'User associated with this token no longer exists.',
        },
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'الحساب معطل أو موقوف مؤقتاً. يرجى مراجعة إدارة النظام.',
          fr: 'Compte inactif ou suspendu. Veuillez contacter l\'administration.',
          en: 'Account is inactive or suspended. Please contact system admin.',
        },
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: {
          ar: 'الحساب مقفل مؤقتاً بسبب عدة محاولات فاشلة.',
          fr: 'Compte temporairement verrouillé suite à plusieurs échecs de connexion.',
          en: 'Account temporarily locked due to multiple failed attempts.',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: {
        ar: 'جلسة العمل انتهت أو الرمز غير صالح.',
        fr: 'Session expirée ou jeton d\'accès invalide.',
        en: 'Session expired or invalid access token.',
      },
      error: error.message,
    });
  }
};

module.exports = { protect };
