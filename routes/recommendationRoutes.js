const express = require("express");
const { getRecommendations } = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Optional protect middleware (doesn't strictly block unauthenticated users, allows generic recommendations)
const optionalAuth = (req, res, next) => {
  protect(req, res, (err) => {
    // If token is invalid or missing, we just proceed as guest
    if (err || !req.user) {
      req.user = null;
    }
    next();
  });
};

router.get("/", optionalAuth, getRecommendations);

module.exports = router;
