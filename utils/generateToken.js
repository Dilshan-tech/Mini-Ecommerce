const jwt = require("jsonwebtoken");

const generateToken = userId => {
  const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

module.exports = generateToken;
