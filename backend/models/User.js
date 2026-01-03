const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
  // Password reset tokens
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // 🧊 STREAK FREEZE SYSTEM
  streakFreeze: {
    credits: { type: Number, default: 0, min: 0, max: 5 }, // Max 5 freezes
    usedDates: [{ type: String }], // Dates when freeze was consumed ['2026-01-05']
    lastEarned: { type: Date }, // Track when last freeze was earned
    totalEarned: { type: Number, default: 0 }, // Lifetime stat
    totalUsed: { type: Number, default: 0 }, // Lifetime stat
    manualActivations: { type: Number, default: 0 }, // Track manual uses
  },
});

module.exports = mongoose.model('User', UserSchema);