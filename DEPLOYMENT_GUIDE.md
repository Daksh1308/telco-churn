# Deployment Guide

Complete step-by-step instructions to deploy the Churn Prediction app.

## Project Structure

```
churn-prediction-app/
├── backend/                 # FastAPI backend (for Render)
│   ├── main.py              # API endpoint
│   ├── model.pkl            # Trained ML model
│   ├── scaler.pkl           # Feature scaler
│   └── requirements.txt      # Python dependencies
│
└── frontend/                # Next.js frontend (for Vercel)
    ├── src/app/page.tsx     # Main UI component
    ├── .env.local           # Local API config
    ├── package.json         # Node dependencies
    └── next.config.ts       # Next.js config
```

---

# PART 1: Prepare for Deployment

## Step 1: Restructure Folder

Create a new folder structure:

```bash
# Create main project folder
mkdir churn-prediction-app
cd churn-prediction-app

# Create backend folder and copy files
mkdir backend
cp /path/to/telco-churn/main.py backend/
cp /path/to/telco-churn/model.pkl backend/
cp /path/to/telco-churn/scaler.pkl backend/
cp /path/to/telco-churn/requirements.txt backend/

# Copy frontend (already in telco-churn/frontend)
cp -r /path/to/telco-churn/frontend .
```

## Step 2: Update Frontend Environment

Edit `frontend/.env.local` for production:

```env
# Replace with your Render backend URL after deployment
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

# PART 2: Deploy Backend on Render

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Create a new repository named `churn-prediction-backend`
3. Initialize git and push your code:

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/churn-prediction-backend.git
git push -u origin main
```

## Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not connected)
4. Select your repository: `churn-prediction-backend`
5. Configure the deployment:

| Setting | Value |
|---------|-------|
| Name | churn-prediction-api |
| Region | Oregon (or closest to you) |
| Branch | main |
| Build Command | (leave empty) |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

6. Click **"Create Web Service"**

## Step 3: Wait for Deployment

- Build will take 2-5 minutes
- Once deployed, you'll see a URL like: `https://churn-prediction-api.onrender.com`

## Step 4: Test Your Backend

```bash
# Health check
curl https://your-backend.onrender.com/health

# Test prediction
curl -X POST https://your-backend.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"gender":"Male","SeniorCitizen":0,"Partner":"Yes","Dependents":"No","tenure":12,"PhoneService":"Yes","MultipleLines":"No","InternetService":"Fiber optic","OnlineSecurity":"No","OnlineBackup":"Yes","DeviceProtection":"No","TechSupport":"No","StreamingTV":"No","StreamingMovies":"No","Contract":"Month-to-month","PaperlessBilling":"Yes","PaymentMethod":"Electronic check","MonthlyCharges":70.70,"TotalCharges":120.50}'
```

---

# PART 3: Deploy Frontend on Vercel

## Step 1: Create GitHub Repository

```bash
cd ../frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/yourusername/churn-prediction-frontend.git
git push -u origin main
```

## Step 2: Update API URL

Before pushing, update `frontend/.env.local` with your Render URL:

```env
NEXT_PUBLIC_API_URL=https://churn-prediction-api.onrender.com
```

Then commit and push:

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

## Step 3: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `churn-prediction-frontend`
4. In **"Environment Variables"**, add:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_API_URL | `https://churn-prediction-api.onrender.com` |

5. Click **"Deploy"**

## Step 4: Wait for Deployment

- Build will take 1-3 minutes
- Once deployed, you'll get a URL like: `https://churn-prediction-frontend.vercel.app`

---

# PART 4: Verify Everything Works

1. Open your Vercel frontend URL
2. Fill in the customer form
3. Click "Predict Churn"
4. You should see the prediction result

If it doesn't work, check the troubleshooting below.

---

# PART 5: Common Errors and Fixes

## Error: "Failed to connect to prediction service"

**Cause**: Frontend can't reach the backend API

**Fix**:
1. Check browser console for exact error
2. Verify your `NEXT_PUBLIC_API_URL` is correct
3. Make sure backend is deployed and running

## Error: "CORS policy" in browser console

**Cause**: Backend CORS not configured

**Fix**: In `backend/main.py`, ensure CORS middleware is present:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Error: "ModuleNotFoundError: pandas" on Render

**Cause**: Missing pandas in requirements.txt

**Fix**: Update `backend/requirements.txt`:
```
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.5.0
numpy>=1.24.0
scikit-learn>=1.3.0
pandas>=2.0.0
python-multipart>=0.0.6
```

## Error: "Model or scaler file not found"

**Cause**: Pickle files not included in git

**Fix**: Make sure `model.pkl` and `scaler.pkl` are in the backend folder and committed to git.

## Error: "Build Failed" on Vercel

**Cause**: Often Node version mismatch

**Fix**: Create `frontend/package.json` with engines:
```json
{
  "name": "churn-prediction-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.400.0",
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Error: 500 Internal Server Error on /predict

**Cause**: Input data format mismatch

**Fix**: Ensure the frontend sends the exact JSON format matching the Pydantic model in main.py

---

# Quick Summary

| Step | Action |
|------|--------|
| 1 | Create `backend/` folder with main.py, model.pkl, scaler.pkl, requirements.txt |
| 2 | Push backend to GitHub → Deploy on Render |
| 3 | Copy frontend folder, update `.env.local` with Render URL |
| 4 | Push frontend to GitHub → Deploy on Vercel |
| 5 | Test the full application |

---

# Alternative: Deploy Both on Same Render Instance

If you only want to use Render for everything:

1. Put frontend build files in `backend/public/`
2. Update main.py to serve static files
3. Deploy as a single web service

This is more advanced - stick with the two-service approach above for simplicity!