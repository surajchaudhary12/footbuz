const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    providerId: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
