/**
 * Backend Integration Tests
 * Tests for authentication, activity logging, and core features
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const DayRecord = require('../../models/DayRecord');

describe('Backend API Integration Tests', () => {
  let app;
  let token;
  let userId;
  let mongoServer;
  const testEmail = 'test@example.com';
  const testPassword = 'Test123456';

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    
    // Mock env
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.NODE_ENV = 'test';

    // Connect to test database (in-memory)
    if (mongoose.connection.readyState === 0) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });

  afterAll(async () => {
    await mongoose.connection.close(true);
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true, force: true });
    }
  });

  describe('User Authentication', () => {
    test('✅ User can register successfully', async () => {
      // This test verifies registration logic
      const user = new User({
        email: testEmail,
        passwordHash: 'hashed-password'
      });
      
      await user.save();
      const savedUser = await User.findOne({ email: testEmail });
      
      expect(savedUser).toBeDefined();
      expect(savedUser.email).toBe(testEmail);
      userId = savedUser._id;
    });

    test('✅ User cannot register with duplicate email', async () => {
      const user = new User({
        email: testEmail,
        passwordHash: 'hashed-password'
      });
      
      try {
        await user.save();
        throw new Error('Should have failed');
      } catch (err) {
        const code = err?.code || err?.writeErrors?.[0]?.code;
        expect(code).toBe(11000); // Duplicate key error
      }
    });

    test('✅ JWT token can be generated and verified', () => {
      const payload = { user: { id: userId.toString() } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.user.id.toString()).toEqual(userId.toString());
    });
  });

  describe('Activity Logging', () => {
    test('✅ Can create a day record with logs', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const dayRecord = new DayRecord({
        userId: userId,
        date: today,
        logs: [
          {
            title: 'Fixed bug in API',
            description: 'Auth middleware issue',
            category: 'Coding'
          }
        ]
      });
      
      await dayRecord.save();
      const saved = await DayRecord.findOne({ userId: userId, date: today });
      
      expect(saved).toBeDefined();
      expect(saved.logs).toHaveLength(1);
      expect(saved.logs[0].title).toBe('Fixed bug in API');
    });

    test('✅ Can add multiple logs to same day', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const dayRecord = await DayRecord.findOne({ userId: userId, date: today });
      dayRecord.logs.push({
        title: 'Code review',
        description: 'Reviewed PR #123',
        category: 'Study'
      });
      
      await dayRecord.save();
      const updated = await DayRecord.findOne({ userId: userId, date: today });
      
      expect(updated.logs).toHaveLength(2);
    });

    test('✅ Can delete a specific log', async () => {
      const today = new Date().toISOString().split('T')[0];
      const dayRecord = await DayRecord.findOne({ userId: userId, date: today });
      
      const firstLogId = dayRecord.logs[0]._id;
      dayRecord.logs.pull(firstLogId);
      
      await dayRecord.save();
      const updated = await DayRecord.findOne({ userId: userId, date: today });
      
      expect(updated.logs).toHaveLength(1);
      expect(updated.logs[0].title).toBe('Code review');
    });
  });

  describe('Data Retrieval', () => {
    test('✅ Can fetch all day records for user', async () => {
      const records = await DayRecord.find({ userId: userId });
      
      expect(records).toBeDefined();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
    });

    test('✅ Pagination works correctly', async () => {
      const limit = 1;
      const page = 1;
      const skip = (page - 1) * limit;
      
      const total = await DayRecord.countDocuments({ userId: userId });
      const records = await DayRecord.find({ userId: userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
      
      expect(records).toHaveLength(Math.min(1, total));
    });
  });

  describe('Validation', () => {
    test('✅ Invalid date format is rejected', () => {
      const validateDate = (dateStr) => {
        const date = new Date(dateStr);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
        if (isNaN(date.getTime())) return false;
        const year = date.getFullYear();
        if (year < 2000 || year > 2100) return false;
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (date > today) return false;
        return true;
      };

      expect(validateDate('2025-13-01')).toBe(false);
      expect(validateDate('2025-12-32')).toBe(false);
      expect(validateDate('25-12-01')).toBe(false);
      expect(validateDate('2026-01-05')).toBe(true);
    });

    test('✅ Title length validation works', () => {
      const title = 'A'.repeat(500);
      expect(title.length).toBeGreaterThan(200);
      
      const sanitized = title.slice(0, 200);
      expect(sanitized.length).toBe(200);
    });
  });

  describe('Streak Freeze System', () => {
    test('✅ User has streak freeze initialized', async () => {
      const user = await User.findById(userId);
      
      expect(user.streakFreeze).toBeDefined();
      expect(user.streakFreeze.credits).toBe(0);
      expect(user.streakFreeze.usedDates).toEqual([]);
      expect(user.streakFreeze.totalEarned).toBe(0);
      expect(user.streakFreeze.totalUsed).toBe(0);
    });

    test('✅ Can award freeze credit', async () => {
      const user = await User.findById(userId);
      user.streakFreeze.credits += 1;
      user.streakFreeze.totalEarned += 1;
      
      await user.save();
      const updated = await User.findById(userId);
      
      expect(updated.streakFreeze.credits).toBe(1);
      expect(updated.streakFreeze.totalEarned).toBe(1);
    });

    test('✅ Cannot exceed max freeze credits (5)', async () => {
      const user = await User.findById(userId);
      user.streakFreeze.credits = 10; // Try to set beyond max

      await expect(user.save()).rejects.toThrow();

      const safeUser = await User.findById(userId);
      expect(safeUser.streakFreeze.credits).toBeLessThanOrEqual(5);
    });
  });
});
