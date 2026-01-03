# DevTracker

A productivity tracking application to help developers track their daily progress and maintain streaks.

## Project Structure

This project is organized as two separate applications:

```
DevTracker/
├── frontend/       # React + Vite frontend application
├── backend/        # Express.js backend API
└── README.md       # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (copy `.env.example` to `.env` and update values):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devtracker
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Start development server:
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (copy `.env.example` to `.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Features

- 📊 Daily activity tracking
- 🔥 Streak monitoring
- 📈 Statistics and analytics
- 🎯 Goal setting
- 🔐 User authentication
- 🌙 Dark/Light theme support
- ❄️ Streak freeze functionality

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- Axios

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB

## Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

MIT
