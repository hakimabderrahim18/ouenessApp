const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      ar: { type: String, required: true, trim: true },
      latin: { type: String, required: true, trim: true },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password in queries by default
    },
    professionalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    jobTitle: {
      ar: { type: String, default: '' },
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    department: {
      ar: { type: String, default: 'العمليات اللوجستية' },
      fr: { type: String, default: 'Opérations Logistiques' },
      en: { type: String, default: 'Logistics Operations' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    preferredLanguage: {
      type: String,
      enum: ['ar', 'fr', 'en'],
      default: 'ar',
    },
    // Senior Management Hierarchy
    isSeniorManagement: {
      type: Boolean,
      default: false,
    },
    seniorityRank: {
      type: Number,
      default: 99, // 1 = General Manager, 2 = Operations Manager, etc.
    },
    // Security & lockout fields
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Performance & HR metrics
    performanceScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    completedOperationsCount: {
      type: Number,
      default: 0,
    },
    averageOperationTimeMinutes: {
      type: Number,
      default: 30,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Handle failed login attempts (lock after 5 attempts for 15 minutes)
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  // If previous lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

module.exports = mongoose.model('User', userSchema);
