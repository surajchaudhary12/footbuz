require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const newsRoutes = require("./routes/newsRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const taskQueue = require("./taskQueue/matchUpdateQueue");
const standingsRoutes = require("./routes/standingsRoutes");
const fixturesRouter = require("./routes/fixturesRouter");
const leagueRoutes = require("./routes/leagueRoutes"); // New
const leaguesRoutes = require("./routes/leaguesRoutes"); // New
const articleRoutes = require("./routes/articleRoutes");
const playerSearchRoutes = require("./routes/playerSearchRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const fantasyRoutes = require("./routes/fantasyRoutes");
const cors = require("cors");
const path = require("path");
const app = express();

// CORS configuration - Allow both local development and production frontends
const allowedOrigins = [
  "http://localhost:3000", // Local development with Next.js dev server
  "http://localhost:3173", // Vite dev server (if using Vite)
  process.env.FRONTEND_URL || "", // Production/staging frontend URL from env
].filter((origin) => origin); // Remove empty strings

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!mongoURI) {
  console.error(
    "ERROR: MongoDB URI is not configured. Set MONGODB_URI or MONGO_URL environment variable.",
  );
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Routes
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/players", playerSearchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/fantasy", fantasyRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api", standingsRoutes);
app.use("/api", fixturesRouter);
app.use("/api/leagues", leaguesRoutes);
app.use("/api/league", leagueRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Test route working" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start task queue worker (for fetching live scores)
taskQueue.start();

module.exports = app; // Export for testing purposes
