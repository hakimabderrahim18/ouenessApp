const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role?.name || user.role,
      permissions: user.role?.permissions || [],
      professionalId: user.professionalId,
    },
    process.env.JWT_ACCESS_SECRET || 'loginaft_access_secret_fallback',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'loginaft_refresh_secret_fallback',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'loginaft_access_secret_fallback');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'loginaft_refresh_secret_fallback');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
