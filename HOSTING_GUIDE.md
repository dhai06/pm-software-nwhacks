# 🌐 Complete Hosting Guide for PM Software

## 📋 Overview

Your application has **3 components** that need to be hosted:

1. **Frontend (Next.js)** → Vercel ✅
2. **Backend (FastAPI with CPM)** → Railway/Render/Fly.io 🐍
3. **Database (PostgreSQL)** → Supabase 💾

---

## ❓ Common Questions Answered

### Q: Can I host everything on Vercel?
**A**: No. Vercel is optimized for frontend and serverless functions. Your FastAPI backend with CPM algorithm needs a dedicated Python server, so it must be hosted separately.

### Q: Where should I host the Python backend?
**A**: Best options:
- **Railway** (Easiest, $5 free credit/month)
- **Render** (750 free hours/month)
- **Fly.io** (Good for production)
- **AWS/GCP/Azure** (Enterprise, more complex)

### Q: What about the CPM algorithm in Python?
**A**: The CPM algorithm is **already integrated** into your FastAPI backend (`Backend/cpm.py`). When you deploy the backend, the CPM algorithm goes with it automatically. No separate hosting needed!

### Q: How do they communicate?
**A**: 
```
User Browser → Vercel (Frontend) → Railway (Backend API) → Supabase (Database)
                                           ↓
                                    CPM Algorithm runs here
```

---

## 🎯 Step-by-Step Deployment

### Step 1: Deploy Backend First (Railway - Recommended)

#### Why Railway?
- ✅ Easiest setup
- ✅ Automatic HTTPS
- ✅ Built-in monitoring
- ✅ $5 free credit/month
- ✅ Git-based deployment

#### Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend folder
cd Backend

# Initialize and deploy
railway init
railway up
```

#### Set Environment Variables in Railway:
1. Go to Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Add:
   - `DATABASE_URL`: Your Supabase connection string
   - `PORT`: 8000 (optional, Railway sets this automatically)

#### Get Your Backend URL:
After deployment, Railway gives you a URL like:
```
https://pm-backend-production-xxxx.up.railway.app
```

**Save this URL!** You'll need it for the frontend.

---

### Step 2: Update CORS in Backend

Before deploying frontend, update your backend's CORS to allow your Vercel domain:

1. Open `Backend/main.py`
2. Find the `allow_origins` list
3. Replace `"https://your-app.vercel.app"` with your actual Vercel URL
4. Redeploy backend:
```bash
railway up
```

---

### Step 3: Deploy Frontend to Vercel

#### Via Vercel Dashboard (Easiest):

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Go to Vercel**:
   - Visit https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-backend.railway.app` (your Railway URL)
   - Apply to: Production, Preview, Development

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://your-app.vercel.app`

#### Via Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Set environment variable when prompted
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Deploy to production
vercel --prod
```

---

### Step 4: Final CORS Update

Now that you have your Vercel URL:

1. Update `Backend/main.py`:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-actual-app.vercel.app",  # Your real Vercel URL
    "https://*.vercel.app",  # Preview deployments
]
```

2. Redeploy backend:
```bash
cd Backend
railway up
```

---

## ✅ Verification Steps

### 1. Test Backend
```bash
# Health check
curl https://your-backend.railway.app/health

# Should return: {"status": "healthy"}
```

### 2. Test API Documentation
Visit: `https://your-backend.railway.app/docs`

You should see interactive API documentation with all endpoints.

### 3. Test CPM Endpoint
In the API docs, try the `/api/cpm/calculate` endpoint with sample data.

### 4. Test Frontend
Visit: `https://your-app.vercel.app`

- Create a task
- Add dependencies
- View timeline (CPM calculation happens automatically)

---

## 🔄 Continuous Deployment

Once set up, deployment is automatic:

### Backend (Railway):
```bash
git push origin main
# Railway automatically deploys
```

### Frontend (Vercel):
```bash
git push origin main
# Vercel automatically deploys
```

**That's it!** No manual deployment needed after initial setup.

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Development/Demo):
- **Vercel**: Free forever
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  
- **Railway**: $5 free credit/month
  - ~500 hours of runtime
  - Enough for hobby projects
  - Automatic HTTPS
  
- **Supabase**: Free tier
  - 500MB database
  - 2GB bandwidth/month
  - Automatic backups

**Total Cost**: $0/month (within free tiers)

### Production (Recommended):
- **Vercel Pro**: $20/month
  - Better performance
  - More bandwidth
  - Team features
  
- **Railway**: ~$5-10/month
  - Pay only for what you use
  - Better resources
  
- **Supabase Pro**: $25/month
  - 8GB database
  - Better performance
  - Point-in-time recovery

**Total Cost**: ~$50-55/month

---

## 🚨 Troubleshooting

### Problem: CORS Error in Browser Console
```
Access to fetch at 'https://backend.railway.app' from origin 'https://app.vercel.app' 
has been blocked by CORS policy
```

**Solution**:
1. Add your Vercel URL to `Backend/main.py` allow_origins
2. Redeploy backend: `railway up`

### Problem: API Returns 404
```
Failed to fetch tasks: Not Found
```

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel dashboard
2. Make sure it's your Railway backend URL
3. Redeploy frontend

### Problem: Database Connection Error
```
Could not connect to database
```

**Solution**:
1. Check `DATABASE_URL` in Railway dashboard
2. Verify Supabase connection string format:
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```
3. Check Supabase is running and accessible

### Problem: Build Failed on Vercel
```
Error: Cannot find module 'next'
```

**Solution**:
1. Verify `package.json` has all dependencies
2. Check root directory is set to `frontend`
3. Try manual deploy: `cd frontend && vercel --prod`

---

## 📊 Monitoring Your App

### Vercel Dashboard
- Real-time deployment logs
- Performance metrics
- Error tracking
- Bandwidth usage

### Railway Dashboard
- Server logs
- CPU/Memory usage
- Request metrics
- Deployment history

### Supabase Dashboard
- Database size
- Query performance
- Connection count
- Backup status

---

## 🎓 Learning Resources

### Vercel
- Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

### Railway
- Docs: https://docs.railway.app
- Python Guide: https://docs.railway.app/guides/python

### FastAPI
- Deployment: https://fastapi.tiangolo.com/deployment/
- Docker: https://fastapi.tiangolo.com/deployment/docker/

---

## 🎉 Success Checklist

- [ ] Backend deployed to Railway
- [ ] Backend health check returns 200
- [ ] API docs accessible at `/docs`
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] Can create/update/delete tasks
- [ ] CPM calculation works
- [ ] Timeline view displays correctly
- [ ] No CORS errors in console
- [ ] Mobile responsive

---

## 🔮 Next Steps

1. **Custom Domain** (Optional)
   - Buy domain (Namecheap, Google Domains)
   - Configure in Vercel dashboard
   - Update CORS in backend

2. **Analytics** (Optional)
   - Enable Vercel Analytics
   - Add Google Analytics
   - Set up error tracking (Sentry)

3. **Performance**
   - Enable Vercel Edge Network
   - Optimize images
   - Add caching headers

4. **Security**
   - Add authentication (if needed)
   - Rate limiting
   - Input validation

---

## 📞 Need Help?

If you get stuck:

1. Check deployment logs in Railway/Vercel dashboard
2. Test each component separately
3. Verify environment variables
4. Check this guide's troubleshooting section
5. Consult platform documentation

---

**Remember**: The CPM algorithm is part of your backend. When you deploy the backend to Railway, the CPM algorithm is automatically included and will run on Railway's servers. No separate hosting needed!

**Your Architecture**:
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel    │────→│     Railway      │────→│   Supabase   │
│  (Frontend) │     │  (Backend + CPM) │     │  (Database)  │
└─────────────┘     └──────────────────┘     └──────────────┘
```

Good luck with your deployment! 🚀
