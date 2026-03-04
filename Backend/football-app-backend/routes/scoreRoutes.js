const express = require("express");
const router = express.Router();
const { getScores, getScoreByMatchId } = require("../controllers/scoresController");

router.get("/", getScores);
router.get("/:id", getScoreByMatchId);

module.exports = router;
