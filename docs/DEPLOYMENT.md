# 🚀 Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide walks you through deploying the **Network Attack Forecasting System** with the **FastAPI Backend on Render** and the **React + Vite Dashboard on Vercel**.

---

## 🏗️ Architecture Overview

- **Backend (Render)**: Python FastAPI server running `uvicorn app.api:app`, serving ML risk scoring, MITRE ATT&CK kill-chain mapping, packet parsers, SOAR containment simulation, and autonomous SOC copilot endpoints.
- **Frontend (Vercel)**: React 19 + Tailwind CSS + Vite SPA located in `dashboard/`, communicating with the Render backend via `VITE_API_URL` / direct CORS endpoints.

---

## 🟢 Part 1: Deploy Backend to Render

### Option A: Using Render Blueprint (`render.yaml` - Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect [render.yaml](file:///d:/Network-Attack-Forecasting/render.yaml) and configure the service:
   - **Name**: `network-attack-forecasting-api`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.api:app --host 0.0.0.0 --port $PORT`
6. Click **Apply**.
7. Once deployed, copy your backend URL (e.g., `https://network-attack-forecasting-api.onrender.com`).

---

### Option B: Manual Web Service Creation on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
2. Select your repository.
3. Configure the following fields:
   - **Name**: `network-attack-forecasting-api` (or your preferred name)
   - **Region**: Closest to your users (e.g., Frankfurt, Oregon, Singapore)
   - **Branch**: `main` (or `master`)
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.api:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `PYTHON_VERSION` = `3.11.9`
5. Click **Create Web Service**.
6. Wait for the build logs to show `Application startup complete`.
7. Test the health endpoint in your browser:
   ```
   https://<your-render-app-name>.onrender.com/api/health
   ```
   Expected response: `{"status":"online","engine":"statistical + rule-based"}`

---

## 🔵 Part 2: Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **Edit** and select `dashboard` (⚠️ **Important**)
   - **Build Command**: `npm run build` (or leave default `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Open the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-app-name>.onrender.com` *(your Render backend URL from Part 1, without a trailing slash)*
6. Click **Deploy**.
7. In ~30–60 seconds, Vercel will provide your production domain (e.g. `https://network-attack-forecasting.vercel.app`).

---

## ⚙️ Environment Variables Summary

| Platform | Variable Name | Example Value | Description |
|---|---|---|---|
| **Render** | `PYTHON_VERSION` | `3.11.9` | Python runtime version |
| **Vercel** | `VITE_API_URL` | `https://your-api.onrender.com` | Backend URL for API calls |

---

## 🧪 Verification & Health Check

After both services are deployed:

1. **Backend Verification**:
   - Open `https://<your-render-url>/api/health` → Should return `{"status":"online"}`.
   - Open `https://<your-render-url>/docs` → Interactive Swagger UI documentation.
2. **Frontend Verification**:
   - Open your Vercel URL in your browser.
   - Click **Live Attack Scenarios** (e.g. *Neris C2 Botnet*, *RBot DDoS*) → Verify graphs, MITRE heatmaps, and threat assessments render dynamically.
   - Try the **Autonomous SOC Co-Pilot** and **What-If Defense Simulator** to verify API communication.

---

## 💡 Pro-Tips for Render Free Tier

> [!NOTE]
> Render's free tier services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to wake up (cold start). Once awake, responses are instantaneous.
> To keep the backend warm for live presentations or evaluations, you can configure a free uptime monitor (such as [UptimeRobot](https://uptimerobot.com) or [Cron-job.org](https://cron-job.org)) to ping `https://<your-render-url>/api/health` every 10 minutes.
