const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/myprojectdb";

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB Connected");
    return true;
  } catch (error) {
    console.log("❌ Error:", error);
    return false;
  }
};

module.exports = connectDB;
