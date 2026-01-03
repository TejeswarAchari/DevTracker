# DevTracker - Backend

Express.js REST API for DevTracker productivity tracking application.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB instance (local or cloud)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devtracker
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Development

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Logs
- `GET /api/logs` - Get all logs
- `POST /api/logs` - Create new log
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

### Stats
- `GET /api/stats` - Get user statistics

## Project Structure

```
├── config/         # Configuration files
│   └── db.js      # Database connection
├── middleware/    # Express middleware
│   └── auth.js    # JWT authentication
├── models/        # Mongoose models
│   ├── User.js
│   └── DayRecord.js
├── routes/        # API routes
│   └── api.js
└── index.js       # Entry point
```

## Security Features

- Helmet for security headers
- Rate limiting
- Input validation
- Password hashing
- JWT token authentication
- CORS configuration
