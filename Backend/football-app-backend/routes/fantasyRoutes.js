const express = require("express");
const {
  getBootstrap,
  getFixtures,
  getGwLive,
  getSummary,
  getMySquad,
  saveMySquad,
} = require("../controllers/fantasyController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/bootstrap", getBootstrap);
router.get("/fixtures", getFixtures);
router.get("/gw/:id/live", getGwLive);
router.get("/summary", getSummary);
router.get("/my-squad", authenticateToken, getMySquad);
router.put("/my-squad", authenticateToken, saveMySquad);

module.exports = router;
