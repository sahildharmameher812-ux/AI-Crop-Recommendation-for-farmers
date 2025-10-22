# Render Deployment Guide for CropAI

This guide will help you deploy both the backend and frontend of your CropAI application on Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your code in a Git repository (GitHub, GitLab, or Bitbucket)
3. OpenAI API key (optional, for chatbot functionality)

## Deployment Options

You have two options for deployment:

### Option 1: Deploy Using render.yaml (Recommended)

This will deploy both services automatically from a single configuration file.

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

3. **Set Environment Variables**
   - After deployment, go to each service
   - Add environment variables:
     - Backend: `OPENAI_API_KEY` (if using OpenAI)
     - Frontend: Will automatically get `VITE_API_URL` from backend

### Option 2: Manual Deployment

#### A. Deploy Backend

1. **Create a new Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `cropai-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables** (Backend)
   - `PYTHON_VERSION`: `3.11.0`
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `USE_OPENAI`: `0` or `1`

3. **Click "Create Web Service"**

#### B. Deploy Frontend

1. **Create another Web Service**
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: `cropai-frontend`
     - **Root Directory**: `frontend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

2. **Environment Variables** (Frontend)
   - `NODE_VERSION`: `18.17.0`
   - `VITE_API_URL`: Your backend URL (e.g., `https://cropai-backend.onrender.com`)

3. **Click "Create Web Service"**

## Post-Deployment Steps

1. **Update Frontend API URL**
   - Once backend is deployed, copy its URL
   - Update the `VITE_API_URL` environment variable in frontend service
   - Trigger a manual redeploy of the frontend

2. **Test Your Application**
   - Visit your frontend URL (e.g., `https://cropai-frontend.onrender.com`)
   - Test crop recommendations
   - Test the chatbot (if OpenAI is configured)

3. **Update CORS Settings** (if needed)
   - The backend is configured to allow all origins (`*`)
   - For production, you may want to restrict this to your frontend URL
   - Edit `backend/app.py` and update the CORS middleware

## Important Notes

### Free Tier Limitations

- Services on free tier spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of free usage

### Data Persistence

- The `backend/data/Crop_recommendation.csv` file is included in the deployment
- Model is trained on startup, so first request may be slow
- Consider upgrading to a persistent disk if you need to store user data

### Custom Domain

1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions

## Environment Variables Reference

### Backend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | - | OpenAI API key for chatbot |
| `USE_OPENAI` | No | `0` | Enable/disable OpenAI (0 or 1) |
| `PORT` | Auto | - | Set automatically by Render |

### Frontend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API URL |
| `PORT` | Auto | - | Set automatically by Render |

## Troubleshooting

### Backend Issues

1. **Build fails**: Check Python version and requirements.txt
2. **App crashes**: Check logs in Render dashboard
3. **CSV not found**: Ensure `data/Crop_recommendation.csv` is in repository

### Frontend Issues

1. **Build fails**: Check Node version and package.json
2. **API calls fail**: Verify `VITE_API_URL` is correct
3. **CORS errors**: Check backend CORS configuration

### Common Solutions

```bash
# View logs
Click on service → Logs tab

# Manual redeploy
Click on service → Manual Deploy → Deploy latest commit

# Check environment variables
Click on service → Environment tab
```

## Cost Optimization

1. **Use Static Site for Frontend** (Alternative)
   - Deploy frontend as a Static Site instead of Web Service
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Free and faster

2. **Combine Services** (Advanced)
   - Serve frontend from backend using FastAPI
   - Reduces to one service
   - More complex setup

## Monitoring

- Use Render's built-in monitoring
- Check logs regularly
- Set up email alerts for service failures
- Monitor service health at `/docs` endpoint (backend)

## Next Steps

1. Set up a custom domain
2. Enable HTTPS (automatic on Render)
3. Add database if needed (PostgreSQL on Render)
4. Set up CI/CD for automatic deployments
5. Monitor performance and scale as needed

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check `README.md` for application-specific help
