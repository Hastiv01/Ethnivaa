const express = require('express');
const { VisitorCount } = require('../models');

const router = express.Router();

// Helper to get or initialize the visitor counter row in DB
async function getOrCreateVisitorRecord() {
  const [record] = await VisitorCount.findOrCreate({
    where: { id: 1 },
    defaults: { count: 0 },
  });
  return record;
}

// POST /api/visitors/ping — increment count on every page view
router.post('/ping', async (req, res) => {
  try {
    const record = await getOrCreateVisitorRecord();
    await record.increment('count', { by: 1 });
    const updated = await record.reload();
    return res.json({ count: updated.count });
  } catch (error) {
    console.error('Failed to increment visitor count:', error);
    return res.status(500).json({ error: 'Failed to increment count' });
  }
});

// GET /api/visitors/count — get current count (public)
router.get('/count', async (req, res) => {
  try {
    const record = await getOrCreateVisitorRecord();
    return res.json({ count: record.count });
  } catch (error) {
    console.error('Failed to fetch visitor count:', error);
    return res.status(500).json({ error: 'Failed to fetch count' });
  }
});

module.exports = router;
