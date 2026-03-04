// models/Match.js
const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema(
  {
    event_id: { type: String, unique: true, required: true },
    league: { type: String },
    season: { type: String },
    date: { type: String },
    time: { type: String },
    homeTeam: { type: String },
    awayTeam: { type: String },
    homeScore: { type: Number },
    awayScore: { type: Number },
    status: { type: String },
    player_id: { type: String, required: true, index: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", MatchSchema);
