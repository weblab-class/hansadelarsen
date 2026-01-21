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
});

module.exports = mongoose.model("user", UserSchema);
