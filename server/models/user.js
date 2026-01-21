const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String, // Google name (fallback)
  googleid: String,

  // New Personal Details
  firstName: String,
  lastName: String,
  birthdate: String, // Stored as YYYY-MM-DD
  gender: String, // "Male", "Female", "Other"
  city: { type: String, default: "Boston" },
  socialScore: { type: Number, default: 100 }, // Default starting score

  // Preferences Object
  preferences: {
    ageGap: Number,
    sameGenderOnly: Boolean,
    diningPrice: Number,
    sportsInterest: Number,
    artsInterest: Number,
    outdoorsVibe: Number,
    educationalInterest: Number,
  },
  // 1. The General "Template" (Recurring)
  schedule: { type: Array, default: [] },

  // 2. The Specific Exceptions (Key = Week Date, Value = Grid)
  specificWeeks: { type: Object, default: {} },
  acceptedQuestsByWeek: { type: Object, default: {} }, // Stores the "Accepted" tab data
  ignoredQuestIds: { type: [String], default: [] },
});

module.exports = mongoose.model("user", UserSchema);
