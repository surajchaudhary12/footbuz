// models/scoreModel.js
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  id: { type: String, index: true, sparse: true },
  matchId: { type: String, required: true, unique: true, index: true },
  league: { type: String, default: "Other" },
  status: { type: String, default: "TIMED" },
  utcDate: { type: Date, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  minute: { type: Number, default: null },
  source: { type: String, default: "football-data" },
}, { timestamps: true });

module.exports = mongoose.model("Score", scoreSchema);
