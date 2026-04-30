const express = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("avatar"), updateMyProfile);

module.exports = router;
