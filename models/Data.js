const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 30 },
    score: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Helpful index for sorting
scoreSchema.index({ score: -1, createdAt: 1 });

// Use existing compiled model if it exists (prevents duplicate schema issues)
module.exports =
  mongoose.models.Leaderboard || mongoose.model("Leaderboard", scoreSchema);