import React, { useState, useEffect, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import { get, post } from "../../utilities";
import SegmentedRating from "../modules/SegmentedRating";
import "./Profile.css";

const Profile = () => {
  const { userId, handleLogin } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  const [detailsMessage, setDetailsMessage] = useState("");
  const [prefsMessage, setPrefsMessage] = useState("");

  // --- STATE ---
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    birthdate: "",
    city: "Boston",
    gender: "Male",
    socialScore: 0,
  });

  const [preferences, setPreferences] = useState({
    ageGap: 2,
    sameGenderOnly: false,
    diningPrice: 2,
    sportsInterest: 1,
    artsInterest: 1,
    outdoorsVibe: 1,
    educationalInterest: 1,
  });

  // --- HELPER ---
  const getAge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // --- LOAD DATA ---
  useEffect(() => {
    get("/api/whoami").then((currentUser) => {
      if (currentUser._id) {
        if (currentUser.preferences) {
          setPreferences((prev) => ({ ...prev, ...currentUser.preferences }));
        }
        setPersonalDetails((prev) => ({
          ...prev,
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          birthdate: currentUser.birthdate || "",
          gender: currentUser.gender || "Male",
          city: "Boston",
          socialScore: currentUser.socialScore || 0,
        }));
      }
      setIsLoading(false);
    });
  }, [userId]);

  const handleDetailsChange = (field, value) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (category, newValue) => {
    setPreferences((prev) => ({ ...prev, [category]: newValue }));
  };

  // --- SAVE HANDLERS ---
  const handleSaveDetails = () => {
    const payload = { ...personalDetails };
    post("/api/preferences", payload)
      .then(() => {
        setDetailsMessage("✅ Saved!");
        setTimeout(() => setDetailsMessage(""), 3000);
      })
      .catch(() => setDetailsMessage("❌ Error"));
  };

  const handleSavePreferences = () => {
    const payload = { preferences: preferences };
    post("/api/preferences", payload)
      .then(() => {
        setPrefsMessage("✅ Saved!");
        setTimeout(() => setPrefsMessage(""), 3000);
      })
      .catch(() => setPrefsMessage("❌ Error"));
  };

  // --- RENDER ---
  if (isLoading) return <div className="profile-page-container">Loading...</div>;

  // Not Logged In State
  if (!userId) {
    return (
      <div className="profile-page-container">
        <div
          className="profile-card"
          style={{
            textAlign: "center",
            maxWidth: "300px" /* Smaller width */,
            height: "200px" /* Adapts to content height */,
            borderRadius: "8px" /* More squared (was 16px) */,
            padding: "24px" /* Slightly less padding */,
          }}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Login or Create an Account</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Error")} />
          </div>
        </div>
      </div>
    );
  }

  const age = getAge(personalDetails.birthdate);

  return (
    <div className="profile-page-container">
      <div className="profile-grid">
        {/* --- LEFT COLUMN: PERSONAL DETAILS --- */}
        <div className="profile-card details-form">
          {/* Top Section */}
          <div>
            <h2 style={{ textAlign: "center", margin: 0 }}>Personal Details</h2>
            <hr style={{ margin: "16px 0", borderTop: "1px solid #eee" }} />

            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                value={personalDetails.firstName}
                onChange={(e) => handleDetailsChange("firstName", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                value={personalDetails.lastName}
                onChange={(e) => handleDetailsChange("lastName", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Birthdate</label>
              <input
                type="date"
                value={personalDetails.birthdate}
                onChange={(e) => handleDetailsChange("birthdate", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                value={personalDetails.city}
                disabled
                style={{ backgroundColor: "#eee" }}
              />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select
                value={personalDetails.gender}
                onChange={(e) => handleDetailsChange("gender", e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Social Score</label>
              <div
                style={{
                  padding: "12px",
                  background: personalDetails.socialScore > 0 ? "#e3f2fd" : "#f5f5f5",
                  color: personalDetails.socialScore > 0 ? "#1565c0" : "#757575",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                {personalDetails.socialScore > 0
                  ? `${personalDetails.socialScore} Points`
                  : "Not yet rated"}
              </div>
            </div>
          </div>

          {/* Bottom Section: Button */}
          <div>
            <button className="save-button" onClick={handleSaveDetails}>
              Save Details
            </button>
            {detailsMessage && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "8px",
                  fontWeight: "bold",
                  color: "green",
                }}
              >
                {detailsMessage}
              </div>
            )}
          </div>
        </div>

        {/* --- CENTER COLUMN: AVATAR --- */}
        <div className="middle-column">
          <div className="avatar-card">
            <div className="avatar-circle">👤</div>
            <h1 className="display-name">
              {personalDetails.firstName || "New"} {personalDetails.lastName || "User"}
            </h1>
            {age !== null && !isNaN(age) ? (
              <div className="age-text">{age} years old</div>
            ) : (
              <div className="age-text">Age hidden</div>
            )}
            <p style={{ color: "#888", marginTop: "8px" }}>Boston, MA</p>
          </div>
        </div>

        {/* --- RIGHT COLUMN: PREFERENCES --- */}
        <div className="profile-card preferences-card">
          {/* Top Section */}
          <div>
            <div className="preferences-header">
              <h2>Preferences</h2>
              <p style={{ color: "#666", marginTop: "4px" }}>Interest Scores</p>
            </div>

            {/* RESTORED: Original Label and Class Structure */}
            <div className="setting-row">
              <label style={{ fontWeight: "bold", marginRight: "10px" }}>
                Max Age Difference (Years)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={preferences.ageGap}
                onChange={(e) => handlePreferenceChange("ageGap", parseInt(e.target.value))}
                className="age-input"
              />
            </div>

            <div className="setting-row" style={{ marginBottom: "24px", marginTop: "10px" }}>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={preferences.sameGenderOnly}
                  onChange={(e) => handlePreferenceChange("sameGenderOnly", e.target.checked)}
                  style={{ marginRight: "10px", transform: "scale(1.2)" }}
                />
                Only match with my gender
              </label>
            </div>

            <hr style={{ margin: "24px 0", borderTop: "1px solid #eee" }} />

            <SegmentedRating
              label="Dining Budget ($)"
              value={preferences.diningPrice}
              onChange={(val) => handlePreferenceChange("diningPrice", val)}
              color="#ffca28"
            />
            <SegmentedRating
              label="Sports Interest"
              value={preferences.sportsInterest}
              onChange={(val) => handlePreferenceChange("sportsInterest", val)}
              color="#ef5350"
            />
            <SegmentedRating
              label="Arts & Culture"
              value={preferences.artsInterest}
              onChange={(val) => handlePreferenceChange("artsInterest", val)}
              color="#ab47bc"
            />
            <SegmentedRating
              label="Outdoors Vibe"
              value={preferences.outdoorsVibe}
              onChange={(val) => handlePreferenceChange("outdoorsVibe", val)}
              color="#66bb6a"
            />
            <SegmentedRating
              label="Educational"
              value={preferences.educationalInterest}
              onChange={(val) => handlePreferenceChange("educationalInterest", val)}
              color="#42a5f5"
            />
          </div>

          {/* Bottom Section: Button */}
          <div>
            <button className="save-button" onClick={handleSavePreferences}>
              Save Preferences
            </button>
            {prefsMessage && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "8px",
                  fontWeight: "bold",
                  color: "green",
                }}
              >
                {prefsMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
