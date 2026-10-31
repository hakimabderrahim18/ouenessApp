const User = require('../models/User');
const Role = require('../models/Role');
const LoginLog = require('../models/LoginLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { logAudit } = require('../services/auditService');

// Helper to extract client metadata
const getClientInfo = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  let device = 'Desktop';
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  else if (/tablet/i.test(userAgent)) device = 'Tablet';
  return { ip, userAgent, device };
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { ip, userAgent, device } = getClientInfo(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: {
          ar: 'يرجى تقديم البريد الإلكتروني وكلمة المرور.',
          fr: 'Veuillez renseigner votre email et mot de passe.',
          en: 'Please provide both email and password.',
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshToken')
      .populate('role')
      .populate('warehouse');

    // Case 1: User does not exist
    if (!user) {
      await LoginLog.create({
        email: email.toLowerCase().trim(),
        status: 'FAILED',
        failureReason: 'User not found in system',
        ipAddress: ip,
        userAgent,
        device,
      });

      return res.status(401).json({
        success: false,
        message: {
          ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
          fr: 'Identifiants invalides (email ou mot de passe incorrect).',
          en: 'Invalid credentials (email or password incorrect).',
        },
      });
    }

    // Case 2: Account locked
    if (user.isLocked) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      await LoginLog.create({
        userId: user._id,
        email: user.email,
        status: 'LOCKED',
        failureReason: `Account locked. Time remaining: ${waitMinutes} mins`,
        ipAddress: ip,
        userAgent,
        device,
      });

      return res.status(423).json({
        success: false,
        message: {
          ar: `تم قفل الحساب مؤقتاً لأسباب أمنية. يرجى الانتظار لمدة ${waitMinutes} دقيقة.`,
          fr: `Compte temporairement bloqué pour sécurité. Veuillez patienter ${waitMinutes} minutes.`,
          en: `Account temporarily locked for security. Please wait ${waitMinutes} minutes.`,
        },
      });
    }

    // Case 3: Inactive status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'هذا الحساب معطل. يرجى التواصل مع المدير العام أو مسؤول النظام.',
          fr: 'Ce compte est inactif ou désactivé. Veuillez contacter l\'administration.',
          en: 'This account is deactivated. Please contact administrator.',
        },
      });
    }

    // Case 4: Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      await LoginLog.create({
        userId: user._id,
        email: user.email,
        status: 'FAILED',
        failureReason: 'Incorrect password',
        ipAddress: ip,
        userAgent,
        device,
      });

      return res.status(401).json({
        success: false,
        message: {
          ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
          fr: 'Identifiants invalides (email ou mot de passe incorrect).',
          en: 'Invalid credentials (email or password incorrect).',
        },
      });
    }

    // Success: Reset failed attempts & issue tokens
    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    await LoginLog.create({
      userId: user._id,
      email: user.email,
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent,
      device,
    });

    await logAudit({
      user,
      action: 'LOGIN',
      module: 'AUTH',
      targetId: user._id,
      targetModel: 'User',
      description: {
        ar: `تسجيل دخول ناجح للمستخدم (${user.fullName.ar}) من الجهاز (${device})`,
        fr: `Connexion réussie de l'utilisateur (${user.fullName.latin}) depuis (${device})`,
        en: `Successful login for user (${user.fullName.latin}) from (${device})`,
      },
    });

    // Send HTTP-only cookie for refresh token (supports cross-domain Vercel <-> Render)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم تسجيل الدخول بنجاح. مرحباً بك في منصة LogiNaft!',
        fr: 'Connexion réussie. Bienvenue sur LogiNaft Smart System !',
        en: 'Login successful. Welcome to LogiNaft Smart System!',
      },
      accessToken,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: {
          ar: 'رمز التحديث غير متوفر.',
          fr: 'Jeton de rafraîchissement absent.',
          en: 'Refresh token not provided.',
        },
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id)
      .select('+refreshToken')
      .populate('role')
      .populate('warehouse');

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: {
          ar: 'رمز التحديث غير صالح أو منتهي.',
          fr: 'Jeton de rafraîchissement invalide ou révoqué.',
          en: 'Refresh token is invalid or revoked.',
        },
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: {
        ar: 'انتهت صلاحية جلسة العمل. يرجى إعادة تسجيل الدخول.',
        fr: 'Session expirée. Veuillez vous reconnecter.',
        en: 'Session expired. Please log in again.',
      },
      error: error.message,
    });
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
      await logAudit({
        user: req.user,
        action: 'LOGOUT',
        module: 'AUTH',
        targetId: req.user._id,
        targetModel: 'User',
        description: {
          ar: `تسجيل خروج للمستخدم (${req.user.fullName.ar})`,
          fr: `Déconnexion de l'utilisateur (${req.user.fullName.latin})`,
          en: `Logout for user (${req.user.fullName.latin})`,
        },
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم تسجيل الخروج بنجاح.',
        fr: 'Déconnexion effectuée avec succès.',
        en: 'Logged out successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Current authenticated user
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Update profile / language
const updateProfile = async (req, res, next) => {
  try {
    const { phone, preferredLanguage, photo, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (phone !== undefined) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (photo !== undefined) user.photo = photo;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: {
            ar: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغيير.',
            fr: 'Veuillez saisir votre mot de passe actuel.',
            en: 'Please provide current password to change password.',
          },
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: {
            ar: 'كلمة المرور الحالية غير صحيحة.',
            fr: 'Mot de passe actuel incorrect.',
            en: 'Current password is incorrect.',
          },
        });
      }

      user.password = newPassword;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('role').populate('warehouse');

    await logAudit({
      user: req.user,
      action: 'UPDATE',
      module: 'USERS',
      targetId: user._id,
      targetModel: 'User',
      description: {
        ar: 'تحديث البيانات الشخصية للمستخدم',
        fr: 'Mise à jour des informations du profil',
        en: 'Profile information updated',
      },
    });

    return res.status(200).json({
      success: true,
      message: {
        ar: 'تم تحديث الملف الشخصي بنجاح.',
        fr: 'Profil mis à jour avec succès.',
        en: 'Profile updated successfully.',
      },
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// View Login Logs (for security monitoring)
const getLoginLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.email) filter.email = new RegExp(req.query.email, 'i');

    const logs = await LoginLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email professionalId');

    const total = await LoginLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  getLoginLogs,
};
