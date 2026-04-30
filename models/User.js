const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    googleId: {
      type: String,
      default: ""
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
