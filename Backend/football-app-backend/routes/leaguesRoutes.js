// routes/leaguesRoutes.js

const express = require("express");
const router = express.Router();
const leaguesController = require("../controllers/leaguesController");

// Route to get a list of all leagues
router.get("/", leaguesController);

module.exports = router;
