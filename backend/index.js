require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ==============================
// ENVIRONMENT VALIDATION (CRITICAL)
// ==============================
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI is not defined in .env');
  process.exit(1);
}

const app = express();

// Connect DB
connectDB();

// ==============================
// HTTPS REDIRECT (Production)
// ==============================
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ==============================
// SECURITY MIDDLEWARE
// ==============================

// Helmet - Secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Restrict to specific origin in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate Limiting - Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15min per IP
  message: { msg: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15min
  message: { msg: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: true, // Don't count successful logins
});

app.use('/api', globalLimiter);
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

// Middleware
app.use(express.json({ limit: '10mb' })); // Prevent huge payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================
// HEALTH CHECK ENDPOINT
// ==============================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api', require('./routes/api'));
app.use('/api', require('./routes/api-features'));

// ==============================
// ERROR HANDLING MIDDLEWARE
// ==============================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    msg: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log('🎉  DevTracker Server Started!');
  console.log('🎯  Port:', PORT);
  console.log('🌍  Environment:', process.env.NODE_ENV || 'development');
  console.log('🔐  Security: Enabled (Helmet + Rate Limiting)');
  console.log('✅  Health Check: http://localhost:' + PORT + '/health');
  console.log('📡  API Base: http://localhost:' + PORT + '/api');
  console.log('===================================\n');
});