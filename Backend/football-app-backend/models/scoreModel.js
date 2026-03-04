// models/scoreModel.js
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  matchId: { type: String, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  score: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Score", scoreSchema);
