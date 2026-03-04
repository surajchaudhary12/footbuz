// routes/playerRoutes.js

const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerSearchController");

// Search Players
router.get("/searchPlayers", playerController.searchPlayers);

// Get Player Details
router.get("/playerDetails/:id", playerController.getPlayerDetails);

// Get Player Matches
router.get("/playerMatches/:id", playerController.getPlayerMatches);

module.exports = router;
