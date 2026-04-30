const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const cookieToken = req.cookies?.token;
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "JWT expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    return res.status(401).json({ message: "Unauthorized, user not found" });
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (process.env.DEV_MODE === "true") {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied (Admin only)" });
    }
    next();
  };
};

module.exports = { protect, authorize };
