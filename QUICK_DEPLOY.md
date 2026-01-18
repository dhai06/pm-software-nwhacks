# ⚡ Quick Deploy Reference

## 🚀 Deploy in 10 Minutes

### 1️⃣ Deploy Backend (2 minutes)
```bash
npm install -g @railway/cli
railway login
cd Backend
railway init
railway up
```

**Set in Railway Dashboard**:
- `DATABASE_URL` = Your Supabase connection string

**Get your URL**: `https://xxx.railway.app` ← Save this!

---

### 2️⃣ Update CORS (1 minute)
Edit `Backend/main.py`:
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Your Vercel URL
    "https://*.vercel.app",
]
```

Redeploy:
```bash
railway up
```

---

### 3️⃣ Deploy Frontend (5 minutes)

**Push to GitHub**:
```bash
git add .
git commit -m "Deploy"
git push origin main
```

**Vercel Dashboard**:
1. Go to https://vercel.com
2. Import GitHub repo
3. Root Directory: `frontend`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://xxx.railway.app`
5. Deploy

---

### 4️⃣ Test (2 minutes)

✅ Backend: `https://xxx.railway.app/health`
✅ API Docs: `https://xxx.railway.app/docs`
✅ Frontend: `https://your-app.vercel.app`

---

## 🔧 Environment Variables

### Railway (Backend)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://xxx.railway.app
```

---

## 🎯 URLs You Need

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | `https://your-app.vercel.app` | Your app |
| Backend | `https://xxx.railway.app` | API server |
| API Docs | `https://xxx.railway.app/docs` | Test API |
| Database | Supabase dashboard | Manage data |

---

## 🐛 Quick Fixes

**CORS Error?**
→ Add Vercel URL to `Backend/main.py` and redeploy

**API 404?**
→ Check `NEXT_PUBLIC_API_URL` in Vercel

**Database Error?**
→ Verify `DATABASE_URL` in Railway

---

## 📱 Commands

```bash
# Backend
cd Backend
railway up

# Frontend
cd frontend
vercel --prod

# Check status
railway status
vercel ls
```

---

## 💡 Pro Tips

1. **Free Tier Limits**:
   - Vercel: 100GB bandwidth/month
   - Railway: $5 credit/month (~500 hours)
   - Supabase: 500MB database

2. **Auto Deploy**:
   - Push to GitHub = Auto deploy on both platforms

3. **Preview Deployments**:
   - Every PR gets a preview URL on Vercel

4. **Logs**:
   - Railway: `railway logs`
   - Vercel: Dashboard → Deployments → Logs

---

## ✅ Success Checklist

- [ ] Backend deployed to Railway
- [ ] `DATABASE_URL` set in Railway
- [ ] Backend `/health` returns 200
- [ ] CORS updated with Vercel URL
- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] App loads without errors
- [ ] Can create tasks
- [ ] CPM calculation works

---

**Done!** Your app is live! 🎉

For detailed guide, see: `HOSTING_GUIDE.md`
