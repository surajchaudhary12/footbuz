// models/Player.js
const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema(
  {
    player_id: { type: String, unique: true, required: true },
    name: { type: String, required: true, index: true },
    position: { type: String },
    nationality: { type: String },
    team: { type: String },
    league: { type: String },
    photo_url: { type: String },
    description: { type: String },
    birthday: { type: String },
    height: { type: String },
    weight: { type: String },
    jerseyNumber: { type: String },
    social: {
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", PlayerSchema);
