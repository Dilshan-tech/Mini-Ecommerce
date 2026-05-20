/**
 * LuxeCart Centralized Environment Validator
 * Validates, handles fallbacks, and alerts of missing integrations on server startup.
 */

const validateEnv = () => {
  // Set sensible defaults for local development
  process.env.PORT = process.env.PORT || 5000;
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
  process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || `http://localhost:${process.env.PORT}`;

  const isProduction = process.env.NODE_ENV === "production";
  const errors = [];
  const warnings = [];

  // Required: MONGO_URI
  if (!process.env.MONGO_URI) {
    if (isProduction) {
      errors.push("MONGO_URI is required in production mode.");
    } else {
      process.env.MONGO_URI = "mongodb://127.0.0.1:27017/ecommerceDB";
      warnings.push("MONGO_URI not specified. Falling back to local: mongodb://127.0.0.1:27017/ecommerceDB");
    }
  }

  // Required: JWT_SECRET
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      errors.push("JWT_SECRET is required in production mode to sign secure tokens.");
    } else {
      process.env.JWT_SECRET = "luxecart_development_secure_fallback_secret_key_9988";
      warnings.push("JWT_SECRET not specified. Using local development fallback secret.");
    }
  }

  // Optional: Google Auth
  const hasGoogleAuth = 
    process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CALLBACK_URL;
  
  if (!hasGoogleAuth) {
    warnings.push("Google OAuth variables are missing. Google Auth login will be disabled.");
  }

  // Optional: Cloudinary
  const hasCloudinary = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;
  
  if (!hasCloudinary) {
    warnings.push("Cloudinary variables are missing. Profile picture uploads will fall back to local disk storage (/uploads).");
  }

  // Print summary to console with premium styling
  console.log("\n=======================================================");
  console.log("🌟 LUXECART ENVIRONMENT SETUP STATUS");
  console.log(`🔹 Mode:       ${process.env.NODE_ENV}`);
  console.log(`🔹 Port:       ${process.env.PORT}`);
  console.log(`🔹 Base URL:   ${process.env.CLIENT_ORIGIN}`);
  
  if (warnings.length > 0) {
    console.log("\n⚠️  CONFIGURATION WARNINGS:");
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ CRITICAL ERRORS (STARTUP CRASHED):");
    errors.forEach(err => console.error(`   - ${err}`));
    console.log("=======================================================\n");
    throw new Error("LuxeCart startup failed due to missing required environment configuration. Please check your system variables.");
  } else {
    console.log("\n✅ Configuration loaded successfully. Ready to launch!");
    console.log("=======================================================\n");
  }
};

module.exports = validateEnv;
