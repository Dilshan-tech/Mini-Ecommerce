const express = require("express");
const passport = require("passport");
const { signup, login, googleCallback, logout } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { signupValidator, loginValidator } = require("../validators/authValidators");

const router = express.Router();
const isGoogleEnabled = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_CALLBACK_URL);

router.post("/signup", upload.single("avatar"), signupValidator, validateRequest, signup);
router.post("/login", loginValidator, validateRequest, login);
router.post("/logout", logout);

if (isGoogleEnabled()) {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false
    })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/login.html"
    }),
    googleCallback
  );
} else {
  router.get("/google", (_req, res) => {
    res.status(503).json({
      message: "Google login is not configured on server.",
      requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"]
    });
  });

  router.get("/google/callback", (_req, res) => {
    res.status(503).json({
      message: "Google login callback is not configured on server.",
      requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"]
    });
  });
}

module.exports = router;
