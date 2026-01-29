const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  name: String,
  googleId: String,
  score: Number,
});

module.exports = mongoose.model("score", ScoreSchema);
