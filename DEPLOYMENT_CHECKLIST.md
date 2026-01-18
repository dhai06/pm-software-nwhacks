# ✅ Deployment Checklist

Use this checklist to ensure smooth deployment of your PM Software.

## 🔧 Pre-Deployment

- [ ] Database is set up on Supabase
- [ ] All migrations have been run
- [ ] Backend runs locally without errors (`uvicorn main:app --reload`)
- [ ] Frontend runs locally without errors (`npm run dev`)
- [ ] Frontend connects to backend successfully
- [ ] CPM algorithm works correctly
- [ ] Code is committed to GitHub

## 🐍 Backend Deployment

- [ ] Choose hosting platform (Railway/Render/Fly.io)
- [ ] Create account on chosen platform
- [ ] Deploy backend
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `PORT` environment variable (if needed)
- [ ] Test health endpoint: `https://your-backend.com/health`
- [ ] Test API docs: `https://your-backend.com/docs`
- [ ] Copy backend URL for frontend configuration

## 🎨 Frontend Deployment

- [ ] Update CORS in `Backend/main.py` with Vercel URL
- [ ] Redeploy backend with updated CORS
- [ ] Create Vercel account
- [ ] Import GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Deploy frontend
- [ ] Test frontend loads correctly
- [ ] Test frontend connects to backend

## 🧪 Post-Deployment Testing

- [ ] Create a new task
- [ ] Update a task
- [ ] Delete a task
- [ ] Create task dependencies
- [ ] Run CPM calculation
- [ ] Check critical path is displayed correctly
- [ ] Test on mobile device
- [ ] Test on different browsers

## 🔐 Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] Database credentials are secure
- [ ] CORS is properly configured (not using `*`)
- [ ] HTTPS is enabled (automatic on Vercel/Railway)

## 📊 Monitoring Setup (Optional)

- [ ] Set up error tracking (Sentry)
- [ ] Enable Vercel Analytics
- [ ] Configure backend logging
- [ ] Set up uptime monitoring

## 🎯 Final Steps

- [ ] Share app URL with team
- [ ] Document any custom setup steps
- [ ] Create backup of database
- [ ] Test disaster recovery process

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Add your Vercel URL to `Backend/main.py` allow_origins and redeploy

### Issue: API 404 Error
**Solution**: Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables

### Issue: Database Connection Failed
**Solution**: Check `DATABASE_URL` format and Supabase connection string

### Issue: Build Failed
**Solution**: Check build logs, verify all dependencies are listed

---

## 📞 Support Resources

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Supabase Support**: https://supabase.com/support

---

**Last Updated**: January 2026
