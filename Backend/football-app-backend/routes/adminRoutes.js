const express = require("express");
const { authenticateToken, requireRole } = require("../middlewares/authMiddleware");
const { getAdminOverview } = require("../controllers/adminController");

const router = express.Router();

router.get("/overview", authenticateToken, requireRole("admin"), getAdminOverview);

module.exports = router;
