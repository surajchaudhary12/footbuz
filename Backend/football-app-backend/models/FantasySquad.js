const mongoose = require("mongoose");

const fantasySquadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    playerIds: { type: [Number], default: [] },
    captainId: { type: Number, default: null },
    updatedAtSource: { type: String, default: "manual" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FantasySquad", fantasySquadSchema);
