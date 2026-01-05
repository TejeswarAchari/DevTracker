const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  title: {
    type: String,
    maxlength: 200,
    default: ''
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  mood: {
    type: String,
    enum: ['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'excited', 'stressed', 'tired'],
    default: 'neutral'
  },
  moodIntensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  people: [{
    type: String,
    maxlength: 100,
    trim: true
  }],
  gratitude: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  reflection: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index: one entry per user per day
DiaryEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
DiaryEntrySchema.index({ userId: 1, createdAt: -1 });
DiaryEntrySchema.index({ userId: 1, mood: 1 });

DiaryEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);
