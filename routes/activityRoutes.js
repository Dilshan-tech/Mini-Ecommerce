const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createActivity, getMyActivity } = require("../controllers/activityController");

const router = express.Router();

router.post("/", protect, createActivity);
router.get("/", protect, getMyActivity);

module.exports = router;
