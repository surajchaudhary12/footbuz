// routes/newsRoutes.js

const express = require("express");
const {
  getAllPlayers,
  getPlayersTransfers,
  getPlayersNews,
  getBettingLaLiga,
  getBettingPremierLeague,
  // ...other controller imports
} = require("../controllers/newsController");
const router = express.Router();


// New Routes
router.get("/players", getAllPlayers); // GET /players
router.get("/players/transfers", getPlayersTransfers); // GET /players/transfers
router.get("/players/news", getPlayersNews); // GET /players/news

router.get("/betting/laliga", getBettingLaLiga); // GET /betting/laliga
router.get("/betting/premuire-league", getBettingPremierLeague); // GET /betting/premuire-league

// ...other routes

module.exports = router;
