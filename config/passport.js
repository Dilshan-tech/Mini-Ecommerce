const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const configurePassport = () => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CALLBACK_URL
  ) {
    console.warn("Google OAuth env vars missing; Google login disabled.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account email is required"), null);
          }

          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || "",
              authProvider: "google"
            });
          } else {
            user.googleId = profile.id;
            user.authProvider = "google";
            if (!user.avatarUrl && profile.photos?.[0]?.value) {
              user.avatarUrl = profile.photos[0].value;
            }
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

module.exports = configurePassport;
