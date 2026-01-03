# Deploying DevTracker

## Frontend - Vercel Deployment

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy from frontend folder:**
```bash
cd frontend
vercel login
vercel
```

3. **Follow prompts:**
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No (first time) or Yes (if exists)
   - What's your project's name? devtracker-frontend
   - In which directory is your code located? ./
   - Override settings? No

4. **Set environment variable in Vercel dashboard:**
   - Go to your project settings
   - Add `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

### Option 2: Vercel Dashboard (Git)

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Import project on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Set root directory to `frontend`
   - Add environment variable:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Click Deploy

---

## Backend - Render Deployment

### Option 1: Render Dashboard (Git)

1. **Push code to GitHub** (if not already done)

2. **Create new Web Service on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** devtracker-backend
     - **Root Directory:** `backend`
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free

3. **Add environment variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `JWT_SECRET` = `your-secure-jwt-secret`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://devtracker-backend.onrender.com`)

5. **Update Frontend Environment:**
   - Go back to Vercel
   - Update `VITE_API_URL` with your Render backend URL
   - Redeploy frontend

### Option 2: Render CLI

1. **Install Render CLI:**
```bash
npm install -g render
```

2. **Deploy:**
```bash
cd backend
render deploy
```

---

## MongoDB Setup (Required for Backend)

### Option 1: MongoDB Atlas (Recommended)

1. **Create free cluster:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up and create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy connection string

2. **Update connection string:**
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `devtracker`
   - Add to Render environment variables

### Option 2: Local MongoDB (Development Only)

```bash
MONGODB_URI=mongodb://localhost:27017/devtracker
```

---

## Post-Deployment Checklist

### Backend (Render)
- ✅ Environment variables configured
- ✅ MongoDB connection working
- ✅ Health check endpoint responding
- ✅ CORS configured for frontend domain

### Frontend (Vercel)
- ✅ `VITE_API_URL` points to Render backend
- ✅ Build successful
- ✅ API requests working
- ✅ Authentication flow tested

---

## Important Notes

### CORS Configuration
Make sure your backend allows requests from your Vercel domain. Update `server/index.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Free Tier Limitations
- **Render Free:** Spins down after 15 minutes of inactivity (first request may be slow)
- **Vercel Free:** Generous limits for personal projects
- **MongoDB Atlas Free:** 512MB storage limit

---

## Troubleshooting

### Backend not responding
- Check Render logs
- Verify environment variables
- Test MongoDB connection
- Check if service is sleeping (free tier)

### Frontend API errors
- Verify `VITE_API_URL` is correct
- Check CORS configuration
- Inspect browser console for errors
- Test API endpoints directly

### Build failures
- Check Node version compatibility
- Verify all dependencies in package.json
- Review build logs on platform
