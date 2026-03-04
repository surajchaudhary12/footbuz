// routes/fixturesRouter.js
const express = require("express");
const router = express.Router();
const { getFixtures } = require("../controllers/fixturesController");

// Define the /fixtures route
router.get("/fixtures", getFixtures);

module.exports = router;
