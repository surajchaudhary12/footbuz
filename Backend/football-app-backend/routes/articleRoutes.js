// routes/articleRoutes.js

const express = require("express");
const {
  getArticles,
  addArticle,
  getArticleById,
} = require("../controllers/articleController");
const router = express.Router();
const fs = require("fs");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// Routes for user articles
router.get("/", getArticles); // GET /api/articles
router.post(
  "/add",
  authenticateToken,
  requireRole("admin"),
  upload.single("headingImage"),
  addArticle
); // POST /api/articles/add
router.get("/:id", getArticleById); // GET /api/articles/:id

module.exports = router;
