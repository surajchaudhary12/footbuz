const express = require("express");
const router = express.Router();
const scoresController = require("../controllers/scoresController");

router.get("/", scoresController);

module.exports = router;
