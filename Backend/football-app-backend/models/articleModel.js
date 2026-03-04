const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
  source: String,
});

module.exports = mongoose.model("Article", articleSchema);
