const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const uploadImage = require("../utils/uploadImage");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let avatarUrl = req.file ? `/uploads/${req.file.filename}` : "";
  if (req.file?.path) {
    const cloudinaryAvatar = await uploadImage(req.file.path, "ecommerce/users");
    if (cloudinaryAvatar) {
      avatarUrl = cloudinaryAvatar;
    }
  }

  const isFirstUser = (await User.countDocuments()) === 0;

  const user = await User.create({
    name,
    email,
    password: passwordHash,
    role: isFirstUser ? "admin" : "user",
    avatarUrl,
    authProvider: "local"
  });

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    message: "Signup successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  });
});

const googleCallback = asyncHandler(async (req, res) => {
  const token = generateToken(req.user._id);
  res.cookie("token", token, cookieOptions);
  res.redirect("/profile.html");
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = { signup, login, googleCallback, logout };
