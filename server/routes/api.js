const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const DayRecord = require('../models/DayRecord');
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

module.exports = router;