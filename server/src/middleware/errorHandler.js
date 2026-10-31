const errorHandler = (err, req, res, next) => {
  console.error('[Server Error Handler]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      message: {
        ar: 'بيانات غير صالحة تم إدخالها.',
        fr: 'Données de formulaire invalides.',
        en: 'Invalid form input data.',
      },
      errors,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: {
        ar: `القيمة المدخلة في حقل (${field}) مستخدمة بالفعل مسبقاً.`,
        fr: `La valeur du champ (${field}) existe déjà dans la base.`,
        en: `The value for field (${field}) already exists in the system.`,
      },
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: {
        ar: 'معرف غير صالح أو غير موجود.',
        fr: 'Identifiant invalide ou introuvable.',
        en: 'Invalid or malformed identifier.',
      },
    });
  }

  // Fallback 500 error
  res.status(err.status || 500).json({
    success: false,
    message: {
      ar: err.message || 'حدث خطأ غير متوقع في الخادم.',
      fr: err.message || 'Une erreur inattendue est survenue sur le serveur.',
      en: err.message || 'An unexpected internal server error occurred.',
    },
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
