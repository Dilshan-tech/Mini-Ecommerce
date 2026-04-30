const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminName = process.env.ADMIN_NAME || "System Admin";

    const existingAdmin = await User.findOne({ email: adminEmail });
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.name = adminName;
      existingAdmin.password = passwordHash;
      existingAdmin.role = "admin";
      existingAdmin.authProvider = "local";
      await existingAdmin.save();
      console.log(`Admin updated: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        role: "admin",
        authProvider: "local"
      });
      console.log(`Admin created: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
