const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    maxlength: 1000,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['article', 'video', 'tutorial', 'documentation', 'tool', 'code', 'book', 'course', 'podcast', 'other'],
    default: 'article'
  },
  url: {
    type: String,
    match: /^(https?:\/\/)?.+/,
    default: ''
  },
  category: {
    type: String,
    maxlength: 100,
    default: ''
  },
  subcategory: {
    type: String,
    maxlength: 100,
    default: ''
  },
  tags: [{
    type: String,
    maxlength: 50,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['unread', 'reading', 'completed', 'reviewed', 'archived'],
    default: 'unread'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 2000,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  sourceDate: {
    type: Date,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
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

// Indexes for faster queries
ResourceSchema.index({ userId: 1, createdAt: -1 });
ResourceSchema.index({ userId: 1, status: 1 });
ResourceSchema.index({ userId: 1, resourceType: 1 });
ResourceSchema.index({ userId: 1, tags: 1 });
ResourceSchema.index({ userId: 1, priority: 1 });

// Update updatedAt on save
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema);
