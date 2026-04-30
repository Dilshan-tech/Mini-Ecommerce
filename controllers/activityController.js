const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");

const createActivity = asyncHandler(async (req, res) => {
  const { action, productId, productName, source, metadata } = req.body;

  const activity = await Activity.create({
    user: req.user._id,
    action,
    productId: productId || "",
    productName: productName || "",
    source: source || "",
    metadata: metadata || {}
  });

  res.status(201).json(activity);
});

const getMyActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const action = req.query.action?.trim();
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;

  const filter = { user: req.user._id };
  if (action) {
    filter.action = action;
  }
  if (from || to) {
    filter.createdAt = {};
    if (from && !Number.isNaN(from.getTime())) {
      filter.createdAt.$gte = from;
    }
    if (to && !Number.isNaN(to.getTime())) {
      filter.createdAt.$lte = to;
    }
  }

  const items = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json({ items, total: items.length });
});

module.exports = { createActivity, getMyActivity };
