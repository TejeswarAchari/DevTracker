# Deployment Quick Start Guide

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com) and sign in**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository** (or create new one first)

4. **Configure service:**
   ```
   Name: devtracker-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = your-mongodb-atlas-connection-string
   JWT_SECRET = your-secret-key-min-32-chars
   CLIENT_URL = will-add-after-vercel-deploy
   ```

6. **Click "Create Web Service"**

7. **Copy your Render URL** (e.g., `https://devtracker-backend-xyz.onrender.com`)

---

### Step 2: Deploy Frontend to Vercel

#### Method A: Vercel CLI (Fastest)

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time)
- What's your project's name? **devtracker** (or your choice)
- In which directory is your code located? **./** (already in frontend folder)
- Want to override settings? **No**

#### Method B: Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com) and sign in**
2. **Click "Add New..." → "Project"**
3. **Import Git Repository**
4. **Configure:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
5. **Add Environment Variable:**
   ```
   VITE_API_URL = https://your-render-backend-url.onrender.com/api
   ```
6. **Click "Deploy"**

---

### Step 3: Update CORS in Backend

After you get your Vercel URL (e.g., `https://devtracker-xyz.vercel.app`):

1. **Go back to Render dashboard**
2. **Navigate to your backend service**
3. **Go to "Environment" tab**
4. **Add/Update variable:**
   ```
   CLIENT_URL = https://your-vercel-url.vercel.app
   ```
5. **Click "Save Changes"** (service will redeploy automatically)

---

## 📋 Pre-Deployment Checklist

### Before deploying Backend:
- [ ] Have MongoDB Atlas account and connection string
- [ ] Generated a secure JWT_SECRET (min 32 characters)
- [ ] Tested backend locally with `npm start`

### Before deploying Frontend:
- [ ] Backend is deployed and running
- [ ] Have backend URL from Render
- [ ] Tested frontend locally with `npm run build`

---

## 🔑 Generate JWT Secret

```powershell
# Generate a random 32-character secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 🗄️ MongoDB Atlas Setup (5 minutes)

1. **Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. **Sign up and create free cluster**
3. **Create Database User:**
   - Username: `devtracker-user`
   - Password: Generate strong password
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere - for Render)
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `devtracker`
   
   Example:
   ```
   mongodb+srv://devtracker-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/devtracker?retryWrites=true&w=majority
   ```

---

## ✅ Testing After Deployment

### Test Backend
Open in browser: `https://your-backend.onrender.com/api/health`

Should return: `{"status": "OK"}` or similar

### Test Frontend
1. Open: `https://your-frontend.vercel.app`
2. Try registering a new account
3. Login and create a log entry
4. Check if data persists

---

## 🐛 Common Issues

### "Backend not responding"
- ⏰ **Free tier spin-down:** First request takes 30-60 seconds
- 🔍 Check Render logs for errors
- ✅ Verify all environment variables are set

### "CORS error in browser"
- 🔗 Ensure `CLIENT_URL` in Render matches your Vercel URL exactly
- 🔄 Redeploy backend after updating CORS
- 🌐 Check browser console for exact error

### "Build failed on Vercel"
- 📦 Make sure `VITE_API_URL` is set in Vercel environment variables
- 🔧 Check build logs for specific errors
- 🔄 Try manual redeploy

---

## 📱 Commands Summary

```powershell
# Deploy frontend to Vercel
cd frontend
vercel --prod

# Check backend locally
cd backend
npm start

# Check frontend locally  
cd frontend
npm run dev
```
