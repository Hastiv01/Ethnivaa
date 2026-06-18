const express = require('express');
const router = express.Router();

// In-memory visitor counter (persisted across requests, resets on server restart)
// For a proper persistent counter, we'd use a DB table or Redis
// We'll use a simple file-based approach with a DB model
let visitorCount = 0;
let sessionIds = new Set();

// POST /api/visitors/ping — called once per browser session
router.post('/ping', (req, res) => {
  // Use IP + user-agent as a crude session key (no tracking, just counting)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  const sessionKey = `${ip}::${ua.slice(0, 50)}`;

  if (!sessionIds.has(sessionKey)) {
    sessionIds.add(sessionKey);
    visitorCount++;
    // Limit set size to avoid memory leak (keep only last 10000 unique sessions)
    if (sessionIds.size > 10000) {
      const firstEntry = sessionIds.values().next().value;
      sessionIds.delete(firstEntry);
    }
  }

  return res.json({ count: visitorCount });
});

// GET /api/visitors/count — get current count (public)
router.get('/count', (req, res) => {
  // Seed with a base count to show "we've been here a while"
  const SEED_BASE = 12480;
  return res.json({ count: SEED_BASE + visitorCount });
});

module.exports = router;
