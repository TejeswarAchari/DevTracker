# DevTracker - Frontend

React-based frontend application for DevTracker productivity tracking.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # React components
│   └── ui/         # Reusable UI components
├── contexts/       # React contexts
└── utils/          # Utility functions
```
