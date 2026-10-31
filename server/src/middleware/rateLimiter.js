const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: {
      ar: 'تم تجاوز الحد المسموح به من الطلبات. يرجى المحاولة لاحقاً بعد عدة دقائق.',
      fr: 'Trop de requêtes effectuées. Veuillez réessayer dans quelques minutes.',
      en: 'Too many requests. Please try again after a few minutes.',
    },
  },
});

// Strict Auth / Login Limiter
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 login attempts per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: {
      ar: 'محاولات دخول كثيرة جداً من هذا الجهاز. تم إيقاف المحاولات مؤقتاً لمدة 10 دقائق.',
      fr: 'Trop de tentatives de connexion depuis cet appareil. Veuillez patienter 10 minutes.',
      en: 'Too many login attempts from this device. Please wait 10 minutes.',
    },
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
