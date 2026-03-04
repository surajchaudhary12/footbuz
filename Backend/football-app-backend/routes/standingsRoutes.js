// routes/standingsRoutes.js
const express = require("express");
const standingsController = require("../controllers/standingsController");

const router = express.Router();

// Define the route for fetching standings
router.get("/standings", standingsController.fetchStandings);

module.exports = router;
