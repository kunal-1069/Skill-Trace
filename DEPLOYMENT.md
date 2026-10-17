# 🚀 Skill-Trace Deployment Guide

This guide explains how to deploy Skill-Trace to production in just a few minutes using **Render** (recommended free tier), **Railway**, or **Docker**.

---

## ⚡ Option 1: Render (Recommended — Free & Easiest)

Render offers free web services that run fullstack Node.js applications directly from your GitHub repository.

### Step 1: Sign up & Connect GitHub
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `https://github.com/kunal-1069/Skill-Trace` (or your fork).
4. Select branch: **`krish`**.

### Step 2: Configure Service Settings
- **Name**: `skill-trace`
- **Region**: Nearest to you (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `krish`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 3: Add Environment Variables
Under the **Environment Variables** section in Render, add:
| Key | Example / Description |
|---|---|
| `NODE_ENV` | `production` |
| `BRIGHTDATA_API_KEY` | Your Bright Data API key |
| `GITHUB_TOKEN` | Optional GitHub PAT for higher rate limits |
| `OPENROUTER_API_KEY` | Optional OpenRouter API key for Qwen 2.5 LLM |
| `GITHUB_CLIENT_ID` | Optional GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | Optional GitHub OAuth Client Secret |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth Client ID |

### Step 4: Deploy
Click **Create Web Service**. Render will:
1. Run `npm install` and `npm run build` (which compiles the Vite React frontend into `Frontend/dist`).
2. Run `npm start` (`node server.js`).
3. Provide you with a live HTTPS URL (e.g., `https://skill-trace.onrender.com`).

---

## 🚂 Option 2: Railway

Railway automatically detects Node.js projects and sets up automated builds.

1. Go to [railway.app](https://railway.app) and click **Start a New Project**.
2. Select **Deploy from GitHub repo** and choose `kunal-1069/Skill-Trace` on the `krish` branch.
3. Click **Add Variables** and paste your environment variables (`BRIGHTDATA_API_KEY`, etc.).
4. Under **Settings** → **Build & Start**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Under **Settings** → **Networking**, click **Generate Domain** to get your public HTTPS URL.

---

## 🐳 Option 3: Docker (Fly.io / AWS / GCP / DigitalOcean)

The repository includes a production-ready multi-stage `Dockerfile`.

### Build & Run Locally with Docker:
```bash
docker build -t skill-trace .
docker run -p 3000:3000 --env-file .env skill-trace
```

### Deploy to Fly.io:
```bash
fly launch
fly secrets set BRIGHTDATA_API_KEY="your-key"
fly deploy
```

---

## 🔑 Updating OAuth Redirect URLs After Deployment

If you enabled GitHub or Google login:
- **GitHub OAuth App**: In GitHub Developer Settings, update the Authorization Callback URL to:
  `https://<your-deployed-app-url>/`
- **Google Cloud Console**: In Authorized JavaScript origins, add:
  `https://<your-deployed-app-url>`
