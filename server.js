const express = require("express");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const GMGN_API_KEY = process.env.GMGN_API_KEY;
const GMGN_BASE = "https://gmgn.ai";

if (!GMGN_API_KEY) {
  console.error("⚠  GMGN_API_KEY not set. Add it to .env or your hosting environment variables.");
  console.error("   The dashboard will load but API calls will fail.\n");
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── GMGN fetch helper ───────────────────────────────────
async function gmgn(endpoint, params = {}) {
  const qs = new URLSearchParams({
    timestamp: Math.floor(Date.now() / 1000).toString(),
    client_id: uuidv4(),
    ...params,
  });
  const url = `${GMGN_BASE}${endpoint}?${qs}`;
  const res = await fetch(url, {
    headers: { "X-APIKEY": GMGN_API_KEY, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data.code !== 0) {
    const err = new Error(data.message || data.error || "GMGN error");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

function err(res, e) {
  console.error("API error:", e.message);
  res.status(e.status || 500).json({ error: e.body || { message: e.message } });
}

// ── API proxy routes ────────────────────────────────────
app.get("/api/wallet/holdings", async (req, res) => {
  try {
    const { chain, wallet_address, order_by, direction, limit, cursor, hide_abnormal, hide_closed, hide_airdrop } = req.query;
    if (!chain || !wallet_address) return res.status(400).json({ error: "chain and wallet_address required" });
    const p = { chain, wallet_address };
    if (order_by) p.order_by = order_by;
    if (direction) p.direction = direction;
    if (limit) p.limit = limit;
    if (cursor) p.cursor = cursor;
    if (hide_abnormal) p.hide_abnormal = hide_abnormal;
    if (hide_closed !== undefined) p.hide_closed = hide_closed;
    if (hide_airdrop !== undefined) p.hide_airdrop = hide_airdrop;
    res.json(await gmgn("/v1/user/wallet_holdings", p));
  } catch (e) { err(res, e); }
});

app.get("/api/wallet/activity", async (req, res) => {
  try {
    const { chain, wallet_address, token_address, limit, cursor, type } = req.query;
    if (!chain || !wallet_address) return res.status(400).json({ error: "chain and wallet_address required" });
    const p = { chain, wallet_address };
    if (token_address) p.token_address = token_address;
    if (limit) p.limit = limit;
    if (cursor) p.cursor = cursor;
    if (type) p.type = type;
    res.json(await gmgn("/v1/user/wallet_activity", p));
  } catch (e) { err(res, e); }
});

app.get("/api/wallet/stats", async (req, res) => {
  try {
    const { chain, wallet_address, period } = req.query;
    if (!chain || !wallet_address || !period) return res.status(400).json({ error: "chain, wallet_address, period required" });
    res.json(await gmgn("/v1/user/wallet_stats", { chain, wallet_address, period }));
  } catch (e) { err(res, e); }
});

app.get("/api/wallet/info", async (req, res) => {
  try { res.json(await gmgn("/v1/user/info")); }
  catch (e) { err(res, e); }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasKey: !!GMGN_API_KEY, time: new Date().toISOString() });
});

// Catch-all: serve index.html for any non-API route (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  GMGN Wallet PnL Analyzer`);
  console.log(`  → http://localhost:${PORT}\n`);
});
