import React, { useState, useEffect, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App"; // Import the context from App.js
import { get, post } from "../../utilities";
import SegmentedRating from "../modules/SegmentedRating";
import "./Profile.css";

const Profile = () => {
  // 1. Get Global Context (This lets us use the App's login logic)
  const { userId, handleLogin } = useContext(UserContext);

  // Local state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  const [preferences, setPreferences] = useState({
    ageGap: 2,
    sameGenderOnly: false,
    diningPrice: 2,
    sportsInterest: 1,
    artsInterest: 1,
    outdoorsVibe: 1,
    educationalInterest: 1,
  });

  // 2. Load data whenever the userId changes (e.g. right after logging in)
  useEffect(() => {
    get("/api/whoami").then((currentUser) => {
      if (currentUser._id) {
        setUser(currentUser);
        if (currentUser.preferences) {
          setPreferences(currentUser.preferences);
        }
      }
      setIsLoading(false);
    });
  }, [userId]); // <--- This [userId] is the key! It re-runs this block when login happens.

  const handleRatingChange = (category, newValue) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: newValue,
    }));
  };

  const handleSave = () => {
    post("/api/preferences", preferences)
      .then((updatedUser) => {
        setSaveMessage("✅ Preferences saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      })
      .catch(() => {
        setSaveMessage("❌ Error saving. Are you logged in?");
      });
  };

  // --- RENDERING ---

  // Loading State
  if (isLoading) {
    return <div className="profile-page-container">Loading...</div>;
  }

  // Not Logged In State (Now with Button!)
  if (!userId) {
    return (
      <div className="profile-page-container">
        <div className="profile-section" style={{ textAlign: "center" }}>
          <h2>Access Restricted</h2>
          <p style={{ marginBottom: "24px" }}>
            Please log in or sign up for an account with Google to create your profile.
          </p>

          {/* Centered Google Login Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
          </div>
        </div>
      </div>
    );
  }

  // Logged In State (The Form)
  return (
    <div className="profile-page-container">
      <h1>Edit Your Profile</h1>
      <div className="profile-section">
        <h2>Your Interests</h2>
        <p className="subtitle">Tell us what you like to do!</p>

        {/* --- AGE GAP --- */}
        <div className="setting-row">
          <label style={{ fontWeight: "bold", marginRight: "10px" }}>
            Max Age Difference (Years)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={preferences.ageGap}
            onChange={(e) => handleRatingChange("ageGap", parseInt(e.target.value))}
            className="age-input"
            style={{ padding: "8px", width: "60px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        {/* --- GENDER PREFERENCE --- */}
        <div className="setting-row" style={{ marginBottom: "24px", marginTop: "10px" }}>
          <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={preferences.sameGenderOnly}
              onChange={(e) => handleRatingChange("sameGenderOnly", e.target.checked)}
              style={{ marginRight: "10px", transform: "scale(1.2)" }}
            />
            Only match with my gender
          </label>
        </div>

        <hr style={{ margin: "24px 0", borderTop: "1px solid #eee" }} />

        {/* --- RATINGS --- */}
        <SegmentedRating
          label="Dining Budget ($)"
          value={preferences.diningPrice}
          onChange={(val) => handleRatingChange("diningPrice", val)}
          color="#ffca28"
        />
        <SegmentedRating
          label="Sports Interest"
          value={preferences.sportsInterest}
          onChange={(val) => handleRatingChange("sportsInterest", val)}
          color="#ef5350"
        />
        <SegmentedRating
          label="Arts & Culture"
          value={preferences.artsInterest}
          onChange={(val) => handleRatingChange("artsInterest", val)}
          color="#ab47bc"
        />
        <SegmentedRating
          label="Outdoors Vibe"
          value={preferences.outdoorsVibe}
          onChange={(val) => handleRatingChange("outdoorsVibe", val)}
          color="#66bb6a"
        />
        <SegmentedRating
          label="Educational / Academic"
          value={preferences.educationalInterest}
          onChange={(val) => handleRatingChange("educationalInterest", val)}
          color="#42a5f5"
        />

        {/* --- SAVE SECTION --- */}
        <button className="save-button" onClick={handleSave}>
          Save Profile
        </button>

        {saveMessage && (
          <div
            style={{
              marginTop: "16px",
              color: saveMessage.includes("✅") ? "green" : "red",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
