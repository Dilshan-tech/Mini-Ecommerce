const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const configurePassport = require("./config/passport");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const activityRoutes = require("./routes/activityRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

configurePassport();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_ORIGIN || `http://localhost:${PORT}`;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/products", productRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.warn("Server started without database connection. API calls requiring DB may fail.");
    setTimeout(() => {
      connectDB().catch(() => undefined);
    }, 10000);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();