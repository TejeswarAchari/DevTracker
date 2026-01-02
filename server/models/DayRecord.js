const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Study', 'Coding', 'Health', 'Personal'], 
    default: 'Study' 
  },
  // points field REMOVED
  createdAt: { type: Date, default: Date.now }
});

const DayRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  logs: [LogSchema],
  // totalPoints field REMOVED. We will use logs.length instead.
});

// Compound index for fast lookup by user and date
DayRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DayRecord', DayRecordSchema);