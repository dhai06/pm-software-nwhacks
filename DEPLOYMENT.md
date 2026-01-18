# 🚀 Deployment Guide

This guide will help you deploy your full-stack Project Management application with CPM algorithm.

## Architecture Overview

- **Frontend**: Next.js → Vercel
- **Backend**: FastAPI (Python) → Railway/Render/Fly.io
- **Database**: PostgreSQL → Supabase
- **CPM Algorithm**: Integrated in Backend

---

## 📦 Prerequisites

1. GitHub account (for code repository)
2. Vercel account (for frontend)
3. Railway/Render account (for backend)
4. Supabase account (already set up)

---

## 🐍 Step 1: Deploy Backend (FastAPI with CPM)

### Option A: Railway (Recommended)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```

#### 3. Deploy Backend
```bash
cd Backend
railway init
railway up
```

#### 4. Set Environment Variables in Railway Dashboard
Go to your Railway project dashboard and add:
```
DATABASE_URL=your_supabase_connection_string
PORT=8000
```

#### 5. Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://your-backend.railway.app`

### Option B: Render.com

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: pm-backend
   - **Root Directory**: `Backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string
6. Click "Create Web Service"

### Option C: Fly.io

```bash
# Install flyctl (Windows PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Navigate to backend
cd Backend

# Launch and deploy
fly launch
fly deploy
```

---

## 🎨 Step 2: Deploy Frontend (Next.js)

### 1. Update Backend URL in Your Code

First, update the CORS settings in `Backend/main.py` with your actual Vercel URL:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-app-name.vercel.app",  # Your actual Vercel URL
    "https://*.vercel.app",  # All preview deployments
]
```

### 2. Push to GitHub

```bash
# From project root
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Via Vercel Dashboard (Easiest):
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend.railway.app` (your backend URL)
6. Click "Deploy"

#### Via Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts and set environment variable when asked
```

---

## 🔧 Step 3: Configure Environment Variables

### Backend Environment Variables (Railway/Render)
```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8000
```

### Frontend Environment Variables (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## ✅ Step 4: Verify Deployment

### Test Backend
Visit: `https://your-backend.railway.app/health`

Should return:
```json
{"status": "healthy"}
```

### Test CPM Endpoint
Visit: `https://your-backend.railway.app/docs`

You'll see the FastAPI interactive documentation with all your endpoints including:
- `/api/tasks/` - Task management
- `/api/dependencies/` - Dependency management
- `/api/cpm/calculate` - CPM algorithm

### Test Frontend
Visit: `https://your-app.vercel.app`

Your app should load and connect to the backend!

---

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull Requests** → Preview deployments (Vercel)
3. **Main branch** → Production deployment

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure your Vercel URL is in the backend's `allow_origins` list
- Redeploy backend after updating CORS settings

### Database Connection Issues
- Verify `DATABASE_URL` in backend environment variables
- Check Supabase connection string format:
  ```
  postgresql://postgres:[password]@[host]:5432/postgres
  ```

### API Not Found (404)
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure it includes `https://` and no trailing slash

### Build Failures
- Check build logs in Vercel/Railway dashboard
- Verify all dependencies are in `package.json` / `requirements.txt`

---

## 💰 Cost Breakdown

### Free Tier Limits:
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Railway**: $5 free credit/month (enough for hobby projects)
- **Render**: 750 hours/month free (one service)
- **Supabase**: 500MB database, 2GB bandwidth/month

### Recommended for Production:
- **Vercel Pro**: $20/month (better performance)
- **Railway**: Pay-as-you-go (~$5-10/month for small apps)
- **Supabase Pro**: $25/month (better database resources)

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Configure in Vercel dashboard
   - Update CORS in backend

2. **Enable HTTPS** (automatic on Vercel/Railway)

3. **Monitor performance**
   - Vercel Analytics
   - Railway Metrics

4. **Set up error tracking** (optional)
   - Sentry
   - LogRocket

---

## 📝 Quick Reference

### Backend URLs
- Health Check: `/health`
- API Docs: `/docs`
- Tasks: `/api/tasks/`
- Dependencies: `/api/dependencies/`
- CPM Calculation: `/api/cpm/calculate`

### Deployment Commands
```bash
# Backend (Railway)
cd Backend
railway up

# Frontend (Vercel)
cd frontend
vercel --prod

# Check status
railway status  # Backend
vercel ls       # Frontend
```

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 🎉 You're Done!

Your PM Software with CPM algorithm is now live and accessible worldwide!

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.railway.app`
**Database**: Supabase (managed)
