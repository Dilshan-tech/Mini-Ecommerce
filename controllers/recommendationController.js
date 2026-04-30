const Activity = require("../models/Activity");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;
  let recommendedProducts = [];
  let categoryPreferences = [];

  // If user is logged in, use their activity to find category preferences
  if (req.user) {
    const recentActivities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const productIds = recentActivities
      .filter(act => act.productId)
      .map(act => act.productId);

    if (productIds.length > 0) {
      const viewedProducts = await Product.find({ _id: { $in: productIds } });
      const categories = viewedProducts.map(p => p.category).filter(Boolean);
      
      // Get unique categories
      categoryPreferences = [...new Set(categories)];
    }
  }

  const query = {};
  
  if (categoryPreferences.length > 0) {
    query.category = { $in: categoryPreferences };
  } else {
    // Fallback for guests or new users
    query.$or = [{ isTrending: true }, { isBestSeller: true }];
  }

  // Fetch products based on preferences, favoring trending/best sellers
  recommendedProducts = await Product.find(query)
    .sort({ isTrending: -1, isBestSeller: -1, createdAt: -1 })
    .limit(limit);

  // If we didn't find enough products, backfill with general popular items
  if (recommendedProducts.length < limit) {
    const existingIds = recommendedProducts.map(p => p._id);
    const backfill = await Product.find({ _id: { $nin: existingIds }, $or: [{ isTrending: true }, { isBestSeller: true }] })
      .sort({ isBestSeller: -1 })
      .limit(limit - recommendedProducts.length);
    
    recommendedProducts = [...recommendedProducts, ...backfill];
  }

  // If still not enough, just backfill with any recent products
  if (recommendedProducts.length < limit) {
    const existingIds = recommendedProducts.map(p => p._id);
    const genericBackfill = await Product.find({ _id: { $nin: existingIds } })
      .sort({ createdAt: -1 })
      .limit(limit - recommendedProducts.length);
      
    recommendedProducts = [...recommendedProducts, ...genericBackfill];
  }

  res.json({ items: recommendedProducts, total: recommendedProducts.length });
});

module.exports = { getRecommendations };
