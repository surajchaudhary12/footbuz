// routes/leagueRoutes.js

const express = require("express");
const router = express.Router();
const leagueController = require("../controllers/leagueController");

// Route to get information about a specific league and its teams
router.get("/:code", leagueController);

module.exports = router;
