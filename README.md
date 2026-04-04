# GMGN Wallet PnL Analyzer

Solana wallet PnL dashboard. Deploy once, access from anywhere (desktop, phone, tablet).

## Quick Deploy (5 minutes)

### Step 1: Get your GMGN API Key

1. Go to https://docs.gmgn.ai/index/generate-public-key and generate a key pair
2. Go to https://gmgn.ai/ai
3. Upload your public key → create API Key
4. Save the API Key somewhere safe

### Step 2: Push to GitHub

1. Create a new repo on github.com (e.g. `gmgn-pnl`)
2. In your terminal:

```bash
cd gmgn-pnl
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/gmgn-pnl.git
git push -u origin main
```

### Step 3: Deploy to Railway (free)

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `gmgn-pnl` repo
4. Go to your project's **Variables** tab
5. Add: `GMGN_API_KEY` = your API key from Step 1
6. Railway auto-deploys. Click "Generate Domain" to get your public URL

Done. Open that URL on your phone, laptop, anywhere.

### Alternative: Deploy to Render (free)

1. Go to https://render.com and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your `gmgn-pnl` repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variable: `GMGN_API_KEY` = your key
6. Click "Create Web Service"

## Local Development

```bash
npm install
echo "GMGN_API_KEY=your_key_here" > .env
npm start
```

Open http://localhost:3001

## How It Works

```
Phone/Desktop Browser
        ↓
  Your Railway URL
        ↓
  Express Server (server.js)
   ├── Serves the dashboard (public/index.html)
   └── Proxies API calls to GMGN with auth
        ↓
  GMGN Agent API (gmgn.ai)
```

The dashboard auto-detects whether the API key is configured:
- **DEMO MODE** (amber badge): No API key, shows mock data
- **LIVE** (green badge): API key set, fetches real wallet data

## Files

```
gmgn-pnl/
├── server.js          # Express server (API proxy + static file server)
├── public/
│   └── index.html     # Full dashboard (React via CDN, self-contained)
├── package.json
├── .gitignore
└── .env               # Your API key (not committed to git)
```
