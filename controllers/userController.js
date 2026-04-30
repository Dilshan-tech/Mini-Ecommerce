const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const uploadImage = require("../utils/uploadImage");

const getMyProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = req.body.name || user.name;
  if (req.file) {
    const cloudinaryAvatar = await uploadImage(req.file.path, "ecommerce/users");
    user.avatarUrl = cloudinaryAvatar || `/uploads/${req.file.filename}`;
  }

  await user.save();
  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
});

module.exports = { getMyProfile, updateMyProfile };
