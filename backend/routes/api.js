const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const DayRecord = require('../models/DayRecord');
const Resource = require('../models/Resource');
const DiaryEntry = require('../models/DiaryEntry');
const auth = require('../middleware/auth');

// ==============================
// VALIDATION HELPERS
// ==============================

const validateDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  
  // Check valid date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  if (isNaN(date.getTime())) return false;
  
  // Reasonable year range (2000-2100)
  if (year < 2000 || year > 2100) return false;
  
  // Can't log future dates beyond today
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return false;
  
  return true;
};

const sanitizeInput = (str, maxLength = 500) => {
  if (!str) return '';
  return str.trim().slice(0, maxLength);
};

// ==============================
// AUTH ROUTES (SECURED)
// ==============================

router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: errors.array()[0].msg,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ email, passwordHash });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// Forgot Password - Request Reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid email address' });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ msg: 'If that email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send email here
    // For now, return token (development only)
    res.json({ 
      msg: 'Reset token generated',
      resetToken, // REMOVE IN PRODUCTION
      resetLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reset Password - Set New Password
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new JWT
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, msg: 'Password reset successful' });
      }
    );
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==============================
// ACTIVITY ROUTES (SECURED & VALIDATED)
// ==============================

// Get All Data (Yearly with pagination)
router.get('/days', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Default: all
    const skip = (page - 1) * limit;

    const days = await DayRecord.find({ 
      userId: req.user.id,
      'logs.0': { $exists: true }
    })
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

    const total = await DayRecord.countDocuments({ 
      userId: req.user.id,
      'logs.0': { $exists: true }
    });
    
    res.json({
      data: days,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get days error:', err);
    res.status(500).json({ msg: 'Server error fetching data' });
  }
});

// Export All Data (JSON backup)
router.get('/export', auth, async (req, res) => {
  try {
    const days = await DayRecord.find({ 
      userId: req.user.id,
      'logs.0': { $exists: true }
    }).sort({ date: 1 });

    const user = await User.findById(req.user.id).select('-passwordHash -resetPasswordToken');
    
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: user.email,
        createdAt: user.createdAt,
        streakFreeze: user.streakFreeze
      },
      activities: days,
      stats: {
        totalDays: days.length,
        totalLogs: days.reduce((sum, day) => sum + day.logs.length, 0)
      }
    };

    res.json(exportData);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ msg: 'Server error exporting data' });
  }
});

// Add/Update Log (FULLY VALIDATED)
router.post('/log', [
  auth,
  body('date').custom(value => {
    if (!validateDate(value)) {
      throw new Error('Invalid date format or out of range');
    }
    return true;
  }),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      msg: errors.array()[0].msg,
      errors: errors.array() 
    });
  }

  const { date, title, description, category } = req.body;
  
  try {
    let day = await DayRecord.findOne({ userId: req.user.id, date });

    // Sanitize inputs
    const newLog = { 
      title: sanitizeInput(title, 200), 
      description: sanitizeInput(description, 1000), 
      category: category || 'other'
    };

    if (day) {
      day.logs.push(newLog);
      await day.save();
    } else {
      day = new DayRecord({
        userId: req.user.id,
        date,
        logs: [newLog],
      });
      await day.save();
    }
    
    res.json(day);
  } catch (err) {
    console.error('Log error:', err);
    res.status(500).json({ msg: 'Server error creating log' });
  }
});

// Delete a Log (SECURED)
router.delete('/log/:date/:logId', auth, async (req, res) => {
  try {
    const { date, logId } = req.params;
    
    // Validate date format
    if (!validateDate(date)) {
      return res.status(400).json({ msg: 'Invalid date format' });
    }
    
    const day = await DayRecord.findOne({ userId: req.user.id, date });
    if (!day) {
      return res.status(404).json({ msg: 'Date not found' });
    }

    // Check if log exists
    const logExists = day.logs.id(logId);
    if (!logExists) {
      return res.status(404).json({ msg: 'Log not found' });
    }

    day.logs.pull(logId);
    
    if (day.logs.length === 0) {
      await DayRecord.deleteOne({ _id: day._id });
      return res.json({ msg: 'Day deleted', date, deleted: true });
    } else {
      await day.save();
      return res.json(day);
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error deleting log' });
  }
});

// ========================================
// 🧊 STREAK FREEZE ENDPOINTS
// ========================================

// Get user's freeze data
router.get('/freeze', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('streakFreeze');
    res.json(user.streakFreeze || { 
      credits: 0, 
      usedDates: [], 
      totalEarned: 0, 
      totalUsed: 0,
      manualActivations: 0 
    });
  } catch (err) {
    console.error('Get freeze error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Award freeze credits (called when user reaches milestones)
router.post('/freeze/earn', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.streakFreeze) {
      user.streakFreeze = { 
        credits: 0, 
        usedDates: [], 
        totalEarned: 0, 
        totalUsed: 0,
        manualActivations: 0 
      };
    }

    // Max 5 credits
    if (user.streakFreeze.credits < 5) {
      user.streakFreeze.credits += 1;
      user.streakFreeze.totalEarned += 1;
      user.streakFreeze.lastEarned = new Date();
      await user.save();
      
      res.json({ 
        msg: 'Freeze credit earned!', 
        credits: user.streakFreeze.credits,
        isNew: true 
      });
    } else {
      res.json({ 
        msg: 'Already at max freeze credits', 
        credits: 5,
        isNew: false 
      });
    }
  } catch (err) {
    console.error('Earn freeze error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Manual freeze activation - NEW!
router.post('/freeze/activate', auth, [
  body('date').custom(value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('Invalid date format');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { date } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.streakFreeze || user.streakFreeze.credits <= 0) {
      return res.status(400).json({ msg: 'No freeze credits available' });
    }

    // Check if already used freeze on this date
    if (user.streakFreeze.usedDates.includes(date)) {
      return res.status(400).json({ msg: 'Freeze already active on this date' });
    }

    // Check if date is in the past or today
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (targetDate > today) {
      return res.status(400).json({ msg: 'Cannot freeze future dates' });
    }

    // Check if user already logged on this date
    const existingLog = await DayRecord.findOne({ 
      userId: req.user.id, 
      date 
    });

    if (existingLog && existingLog.logs.length > 0) {
      return res.status(400).json({ msg: 'You already logged activity on this date' });
    }

    // Consume freeze
    user.streakFreeze.credits -= 1;
    user.streakFreeze.usedDates.push(date);
    user.streakFreeze.totalUsed += 1;
    user.streakFreeze.manualActivations += 1;
    await user.save();

    res.json({ 
      msg: 'Freeze activated successfully!',
      credits: user.streakFreeze.credits,
      date,
      isManual: true 
    });
  } catch (err) {
    console.error('Activate freeze error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get freeze history
router.get('/freeze/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('streakFreeze');
    res.json({
      credits: user.streakFreeze?.credits || 0,
      usedDates: user.streakFreeze?.usedDates || [],
      totalEarned: user.streakFreeze?.totalEarned || 0,
      totalUsed: user.streakFreeze?.totalUsed || 0,
      manualActivations: user.streakFreeze?.manualActivations || 0,
    });
  } catch (err) {
    console.error('Freeze history error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==============================
// RESOURCE LIBRARY ROUTES 📚
// ==============================

// Create resource
router.post('/resources', auth, [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }),
  body('resourceType').isIn(['article', 'video', 'tutorial', 'documentation', 'tool', 'code', 'book', 'course', 'podcast', 'other']),
  body('description').trim().isLength({ max: 1000 }).optional(),
  body('url').trim().isLength({ max: 500 }).optional(),
  body('category').trim().isLength({ max: 100 }).optional(),
  body('subcategory').trim().isLength({ max: 100 }).optional(),
  body('priority').isIn(['high', 'medium', 'low']).optional(),
  body('status').isIn(['unread', 'reading', 'completed', 'reviewed', 'archived']).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const resource = new Resource({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      resourceType: req.body.resourceType,
      url: req.body.url || '',
      category: req.body.category || '',
      subcategory: req.body.subcategory || '',
      tags: req.body.tags || [],
      priority: req.body.priority || 'medium',
      status: req.body.status || 'unread',
      sourceDate: req.body.sourceDate || null,
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error('Create resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all resources (with pagination and filters)
router.get('/resources', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const filters = { userId: req.user.id };
    
    if (req.query.status) {
      filters.status = req.query.status;
    } else {
      filters.status = { $ne: 'archived' };
    }
    if (req.query.resourceType) filters.resourceType = req.query.resourceType;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.tags) {
      filters.tags = { $in: Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags] };
    }

    const sortBy = req.query.sortBy || '-isPinned -createdAt';
    const resources = await Resource.find(filters)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Resource.countDocuments(filters);

    res.json({
      data: resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get resources error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search resources (MUST be before /:id route)
router.get('/resources/search/:query', auth, async (req, res) => {
  try {
    const searchQuery = req.params.query.trim();
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const baseFilter = {
      userId: req.user.id,
      status: { $ne: 'archived' },
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const resources = await Resource.find(baseFilter)
    .sort('-isPinned -createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Resource.countDocuments(baseFilter);

    res.json({
      data: resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Search resources error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get resource stats (MUST be before /:id route)
router.get('/resources/stats/all', auth, async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalResources: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] }
          },
          readingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'reading'] }, 1, 0] }
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          reviewedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          archivedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $facet: {
          byType: [
            { $match: { userId: req.user.id } },
            { $group: { _id: '$resourceType', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $match: { userId: req.user.id } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          stats: [
            { $limit: 1 }
          ]
        }
      }
    ]);

    const overallStats = stats[0]?.stats[0] || {};
    const byType = stats[0]?.byType || [];
    const byPriority = stats[0]?.byPriority || [];

    res.json({
      ...overallStats,
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
      byPriority: Object.fromEntries(byPriority.map(p => [p._id, p.count]))
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single resource
router.get('/resources/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    console.error('Get resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update resource
router.put('/resources/:id', auth, [
  body('title').trim().isLength({ max: 200 }).optional(),
  body('resourceType').isIn(['article', 'video', 'tutorial', 'documentation', 'tool', 'code', 'book', 'course', 'podcast', 'other']).optional(),
  body('priority').isIn(['high', 'medium', 'low']).optional(),
  body('status').isIn(['unread', 'reading', 'completed', 'reviewed', 'archived']).optional(),
  body('rating').isInt({ min: 0, max: 5 }).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    let resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    const updateFields = ['title', 'description', 'resourceType', 'url', 'category', 'subcategory', 'tags', 'priority', 'status', 'rating', 'notes', 'sourceDate'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    // Set completion date when status changes to 'completed'
    if (req.body.status === 'completed' && resource.status !== 'completed') {
      resource.completionDate = new Date();
    }

    await resource.save();
    res.json(resource);
  } catch (err) {
    console.error('Update resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete (hard delete)
router.delete('/resources/:id', auth, async (req, res) => {
  try {
    const deleted = await Resource.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    res.json({ msg: 'Resource deleted' });
  } catch (err) {
    console.error('Delete resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark as complete
router.post('/resources/:id/complete', auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    resource.status = 'completed';
    resource.completionDate = new Date();
    await resource.save();

    res.json(resource);
  } catch (err) {
    console.error('Complete resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Rate resource
router.post('/resources/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    resource.rating = req.body.rating;
    await resource.save();

    res.json(resource);
  } catch (err) {
    console.error('Rate resource error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Toggle pin
router.post('/resources/:id/toggle-pin', auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }

    resource.isPinned = !resource.isPinned;
    await resource.save();

    res.json({
      _id: resource._id,
      isPinned: resource.isPinned
    });
  } catch (err) {
    console.error('Toggle pin error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==============================
// DIARY ROUTES 📓
// ==============================

// Create/update diary entry
router.post('/diary', auth, [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Invalid date format'),
  body('content').trim().notEmpty().withMessage('Content required'),
  body('mood').isIn(['very-happy', 'happy', 'neutral', 'sad', 'very-sad', 'excited', 'stressed', 'tired']).optional(),
  body('moodIntensity').isInt({ min: 1, max: 10 }).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const { date, content, mood, moodIntensity, people, gratitude, reflection } = req.body;

    let entry = await DiaryEntry.findOne({
      userId: req.user.id,
      date
    });

    if (entry) {
      Object.assign(entry, { content, mood, moodIntensity, people, gratitude, reflection });
      await entry.save();
    } else {
      entry = new DiaryEntry({
        userId: req.user.id,
        date,
        content,
        mood: mood || 'neutral',
        moodIntensity: moodIntensity || 5,
        people: people || [],
        gratitude: gratitude || '',
        reflection: reflection || ''
      });
      await entry.save();
    }

    res.status(201).json(entry);
  } catch (err) {
    console.error('Create diary entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get diary entry for date
router.get('/diary/date/:date', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findOne({
      userId: req.user.id,
      date: req.params.date
    });

    if (!entry) {
      return res.status(404).json({ msg: 'No entry for this date' });
    }

    res.json(entry);
  } catch (err) {
    console.error('Get diary entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get entries for year
router.get('/diary/year/:year', auth, async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const entries = await DiaryEntry.find({
      userId: req.user.id,
      date: { $regex: `^${year}-` }
    })
    .sort('-date')
    .lean();

    res.json(entries);
  } catch (err) {
    console.error('Get yearly entries error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get timeline view
router.get('/diary/timeline', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const entries = await DiaryEntry.find({ userId: req.user.id })
      .sort('-date')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DiaryEntry.countDocuments({ userId: req.user.id });

    res.json({
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Timeline error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get on-this-day entries
router.get('/diary/on-this-day', auth, async (req, res) => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePattern = `-${month}-${day}`;

    const entries = await DiaryEntry.find({
      userId: req.user.id,
      date: { $regex: datePattern }
    })
    .sort('-date')
    .lean();

    res.json(entries);
  } catch (err) {
    console.error('On-this-day error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get diary stats
router.get('/diary/stats/all', auth, async (req, res) => {
  try {
    const stats = await DiaryEntry.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          avgMoodIntensity: { $avg: '$moodIntensity' }
        }
      },
      {
        $facet: {
          byMood: [
            { $match: { userId: req.user.id } },
            { $group: { _id: '$mood', count: { $sum: 1 } } }
          ],
          stats: [{ $limit: 1 }]
        }
      }
    ]);

    const overallStats = stats[0]?.stats[0] || {};
    const byMood = stats[0]?.byMood || [];

    res.json({
      ...overallStats,
      byMood: Object.fromEntries(byMood.map(m => [m._id, m.count]))
    });
  } catch (err) {
    console.error('Get diary stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update diary entry
router.put('/diary/:id', auth, async (req, res) => {
  try {
    let entry = await DiaryEntry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    Object.assign(entry, req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error('Update diary error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete diary entry
router.delete('/diary/:id', auth, async (req, res) => {
  try {
    await DiaryEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ msg: 'Entry deleted' });
  } catch (err) {
    console.error('Delete diary error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;