const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    displayName: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, default: '' },
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // System roles cannot be deleted
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
