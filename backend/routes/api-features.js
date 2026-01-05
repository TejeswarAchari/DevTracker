const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Add these models to the top of api.js after line 8:
// const Resource = require('../models/Resource');
// const LearningEntry = require('../models/LearningEntry');
// const DiaryEntry = require('../models/DiaryEntry');
// const Timetable = require('../models/Timetable');
// const MonthlyGoal = require('../models/MonthlyGoal');

// ==============================
// LEARNING JOURNAL ROUTES 📖
// ==============================

// Create learning entry
router.post('/learning', auth, [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Content required').isLength({ max: 5000 }),
  body('entryType').isIn(['lesson', 'insight', 'mistake', 'breakthrough', 'reflection']).optional(),
  body('importance').isIn(['critical', 'important', 'moderate', 'minor']).optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const LearningEntry = require('../models/LearningEntry');
    const entry = new LearningEntry({
      userId: req.user.id,
      ...req.body,
      entryDate: req.body.entryDate || new Date()
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Create learning entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get learning entries for year/month
router.get('/learning/year/:year', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    const year = parseInt(req.params.year);
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const entries = await LearningEntry.find({
      userId: req.user.id,
      entryDate: { $gte: startDate, $lte: endDate }
    })
    .sort('-entryDate')
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await LearningEntry.countDocuments({
      userId: req.user.id,
      entryDate: { $gte: startDate, $lte: endDate }
    });

    res.json({
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('Get learning entries error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get learning entries for specific month
router.get('/learning/year/:year/month/:month', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const entries = await LearningEntry.find({
      userId: req.user.id,
      entryDate: { $gte: startDate, $lte: endDate }
    })
    .sort('-entryDate')
    .lean();

    res.json(entries);
  } catch (err) {
    console.error('Get monthly entries error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single learning entry
router.get('/learning/:id', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    const entry = await LearningEntry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    res.json(entry);
  } catch (err) {
    console.error('Get entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update learning entry
router.put('/learning/:id', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    let entry = await LearningEntry.findOne({
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
    console.error('Update entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete learning entry
router.delete('/learning/:id', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    const entry = await LearningEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }

    res.json({ msg: 'Entry deleted' });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get learning stats
router.get('/learning/stats/all', auth, async (req, res) => {
  try {
    const LearningEntry = require('../models/LearningEntry');
    const stats = await LearningEntry.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          criticalCount: { $sum: { $cond: [{ $eq: ['$importance', 'critical'] }, 1, 0] } },
          importantCount: { $sum: { $cond: [{ $eq: ['$importance', 'important'] }, 1, 0] } }
        }
      },
      {
        $facet: {
          byType: [
            { $match: { userId: req.user.id } },
            { $group: { _id: '$entryType', count: { $sum: 1 } } }
          ],
          stats: [{ $limit: 1 }]
        }
      }
    ]);

    const overallStats = stats[0]?.stats[0] || {};
    const byType = stats[0]?.byType || [];

    res.json({
      ...overallStats,
      byType: Object.fromEntries(byType.map(t => [t._id, t.count]))
    });
  } catch (err) {
    console.error('Get stats error:', err);
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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
    const DiaryEntry = require('../models/DiaryEntry');
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

// ==============================
// TIMETABLE ROUTES 📅
// ==============================

// Create timetable
router.post('/timetable', auth, [
  body('title').trim().notEmpty().withMessage('Title required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const Timetable = require('../models/Timetable');
    const timetable = new Timetable({
      userId: req.user.id,
      ...req.body
    });
    await timetable.save();
    res.status(201).json(timetable);
  } catch (err) {
    console.error('Create timetable error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all timetables
router.get('/timetable', auth, async (req, res) => {
  try {
    const Timetable = require('../models/Timetable');
    const timetables = await Timetable.find({
      userId: req.user.id,
      isArchived: false
    })
    .sort('-createdAt')
    .lean();

    res.json(timetables);
  } catch (err) {
    console.error('Get timetables error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single timetable
router.get('/timetable/:id', auth, async (req, res) => {
  try {
    const Timetable = require('../models/Timetable');
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!timetable) {
      return res.status(404).json({ msg: 'Timetable not found' });
    }

    res.json(timetable);
  } catch (err) {
    console.error('Get timetable error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update timetable
router.put('/timetable/:id', auth, async (req, res) => {
  try {
    const Timetable = require('../models/Timetable');
    let timetable = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!timetable) {
      return res.status(404).json({ msg: 'Timetable not found' });
    }

    Object.assign(timetable, req.body);
    await timetable.save();
    res.json(timetable);
  } catch (err) {
    console.error('Update timetable error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete/archive timetable
router.delete('/timetable/:id', auth, async (req, res) => {
  try {
    const Timetable = require('../models/Timetable');
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!timetable) {
      return res.status(404).json({ msg: 'Timetable not found' });
    }

    timetable.isArchived = true;
    await timetable.save();
    res.json({ msg: 'Timetable archived' });
  } catch (err) {
    console.error('Delete timetable error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Activate timetable
router.post('/timetable/:id/activate', auth, async (req, res) => {
  try {
    const Timetable = require('../models/Timetable');
    // Deactivate all others
    await Timetable.updateMany(
      { userId: req.user.id, isActive: true },
      { isActive: false }
    );

    // Activate this one
    const timetable = await Timetable.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!timetable) {
      return res.status(404).json({ msg: 'Timetable not found' });
    }

    timetable.isActive = true;
    await timetable.save();
    res.json(timetable);
  } catch (err) {
    console.error('Activate timetable error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==============================
// MONTHLY GOALS ROUTES 🎯
// ==============================

// Create goal
router.post('/goals', auth, [
  body('year').isInt({ min: 2000, max: 2100 }),
  body('month').isInt({ min: 1, max: 12 }),
  body('title').trim().notEmpty().withMessage('Title required'),
  body('targetValue').isInt({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    const goal = new MonthlyGoal({
      userId: req.user.id,
      ...req.body
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get goals for month
router.get('/goals/:year/:month', auth, async (req, res) => {
  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const goals = await MonthlyGoal.find({
      userId: req.user.id,
      year,
      month
    })
    .sort('-createdAt')
    .lean();

    res.json(goals);
  } catch (err) {
    console.error('Get goals error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single goal
router.get('/goals/:id', auth, async (req, res) => {
  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    const goal = await MonthlyGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    res.json(goal);
  } catch (err) {
    console.error('Get goal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update goal
router.put('/goals/:id', auth, async (req, res) => {
  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    let goal = await MonthlyGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    Object.assign(goal, req.body);
    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete goal
router.delete('/goals/:id', auth, async (req, res) => {
  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    await MonthlyGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ msg: 'Goal deleted' });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update goal progress
router.post('/goals/:id/progress', auth, [
  body('progress').isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    const goal = await MonthlyGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    goal.currentProgress = req.body.progress;

    // Check if goal is completed
    if (goal.currentProgress >= goal.targetValue) {
      goal.isCompleted = true;
      goal.completedDate = new Date();
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Complete goal
router.post('/goals/:id/complete', auth, async (req, res) => {
  try {
    const MonthlyGoal = require('../models/MonthlyGoal');
    const goal = await MonthlyGoal.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found' });
    }

    goal.isCompleted = true;
    goal.completedDate = new Date();
    goal.currentProgress = goal.targetValue;
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error('Complete goal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get year-end countdown
router.get('/countdown/year-end', auth, async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);
    const daysRemaining = Math.ceil((yearEnd - now) / (1000 * 60 * 60 * 24));

    res.json({
      daysRemaining: Math.max(0, daysRemaining),
      currentYear: year,
      yearEndDate: yearEnd.toISOString()
    });
  } catch (err) {
    console.error('Countdown error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
