# Render Deployment Checklist

## ✅ Pre-Deployment

- [x] `render.yaml` configuration created
- [x] `backend/build.sh` created
- [x] `backend/runtime.txt` created
- [x] `.gitignore` created
- [x] Updated `requirements.txt` with gunicorn
- [x] Updated `vite.config.ts` for production

## 📋 Deployment Steps

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Prepare for Render deployment"
```

### 2. Push to GitHub/GitLab/Bitbucket
```bash
# Create a new repository on GitHub, then:
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main
```

### 3. Deploy on Render

**Option A: Blueprint (Recommended)**
1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect your repository
4. Review and click "Apply"

**Option B: Manual**
- Follow detailed steps in `RENDER_DEPLOYMENT_GUIDE.md`

### 4. Configure Environment Variables

**Backend Service:**
- Add `OPENAI_API_KEY` if using OpenAI chatbot
- Set `USE_OPENAI` to `1` to enable (or `0` to disable)

**Frontend Service:**
- `VITE_API_URL` will be auto-configured from backend
- Verify it points to your backend URL

### 5. Test Your Deployment
1. Wait for both services to deploy (5-10 minutes)
2. Visit your frontend URL
3. Test crop recommendations
4. Test chatbot functionality
5. Check API docs at `YOUR_BACKEND_URL/docs`

## 🔧 Configuration Files Created

- `render.yaml` - Main deployment configuration
- `backend/build.sh` - Backend build script
- `backend/runtime.txt` - Python version
- `.gitignore` - Files to exclude from Git
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed guide
- `DEPLOY_CHECKLIST.md` - This file

## 🚀 Your Service URLs

After deployment, you'll get:
- **Backend**: `https://cropai-backend.onrender.com`
- **Frontend**: `https://cropai-frontend.onrender.com`
- **API Docs**: `https://cropai-backend.onrender.com/docs`

## 📝 Important Notes

1. **First deployment** takes 5-10 minutes
2. **Free tier** services spin down after 15 minutes of inactivity
3. **First request** after spin-down takes 30-60 seconds
4. **Model training** happens on backend startup (may take time)
5. **CORS** is configured for all origins - update for production

## ⚠️ Common Issues

1. **Build fails**: Check logs in Render dashboard
2. **API not connecting**: Verify `VITE_API_URL` is correct
3. **CSV not found**: Ensure `backend/data/Crop_recommendation.csv` is committed
4. **Import errors**: Check all dependencies in `requirements.txt`

## 🎯 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure OpenAI API key for chatbot
- [ ] Monitor service health
- [ ] Set up email alerts
- [ ] Review and optimize CORS settings
- [ ] Consider upgrading for better performance

## 📚 Resources

- [Render Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)
- [Render Dashboard](https://dashboard.render.com)
- [Render Docs](https://render.com/docs)
- [Project README](./README.md)
