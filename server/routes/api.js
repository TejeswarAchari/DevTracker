const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DayRecord = require('../models/DayRecord');
const auth = require('../middleware/auth');

// --- AUTH ROUTES ---

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ email, passwordHash });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});



// --- ACTIVITY ROUTES ---

// Get All Data (Yearly)
router.get('/days', auth, async (req, res) => {
  try {
    // Find days where the logs array is not empty
    const days = await DayRecord.find({ 
      userId: req.user.id,
      'logs.0': { $exists: true } // Efficient way to check for non-empty array
    }).sort({ date: 1 });
    res.json(days);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add/Update Log
router.post('/log', auth, async (req, res) => {
  // 'points' is removed from destructuring
  const { date, title, description, category } = req.body; 
  
  try {
    let day = await DayRecord.findOne({ userId: req.user.id, date });
    
    // 'points' removed from newLog object
    const newLog = { title, description, category };

    if (day) {
      day.logs.push(newLog);
      // No totalPoints update needed
      await day.save();
    } else {
      day = new DayRecord({
        userId: req.user.id,
        date,
        logs: [newLog],
        // No totalPoints initialization needed
      });
      await day.save();
    }
    res.json(day);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a Log
router.delete('/log/:date/:logId', auth, async (req, res) => {
  try {
    const day = await DayRecord.findOne({ userId: req.user.id, date: req.params.date });
    if (!day) return res.status(404).json({ msg: 'Date not found' });

    // No point subtraction needed before pulling
    day.logs.pull(req.params.logId);
    
    // If no logs left, delete the day record entirely
    if (day.logs.length === 0) {
      await DayRecord.deleteOne({ _id: day._id });
      return res.json({ msg: 'Day deleted', date: req.params.date, deleted: true });
    } else {
      await day.save();
      return res.json(day);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;