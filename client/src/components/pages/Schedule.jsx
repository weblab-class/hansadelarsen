import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { get, post } from "../../utilities";
import "./Schedule.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
];

const Schedule = () => {
  const { userId } = useContext(UserContext);
  const [saveMessage, setSaveMessage] = useState("");

  // Initialize a 7x16 grid with 0s (Busy)
  // grid[dayIndex][hourIndex]
  const [grid, setGrid] = useState(
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(0))
  );

  useEffect(() => {
    if (userId) {
      get("/api/whoami").then((user) => {
        // If the user has a saved schedule that matches our dimensions, load it
        if (user.schedule && user.schedule.length === 7) {
          setGrid(user.schedule);
        }
      });
    }
  }, [userId]);

  // Toggle: 0 (Busy) -> 1 (Free) -> 2 (Meal) -> 0
  const handleCellClick = (dayIndex, hourIndex) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]); // Deep copy
      const currentVal = newGrid[dayIndex][hourIndex];
      newGrid[dayIndex][hourIndex] = (currentVal + 1) % 3; // Cycle 0->1->2->0
      return newGrid;
    });
  };

  const handleSave = () => {
    post("/api/schedule", { schedule: grid }).then(() => {
      setSaveMessage("✅ Schedule Saved!");
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  // Helper to get class name based on value
  const getCellClass = (val) => {
    if (val === 1) return "grid-cell cell-free";
    if (val === 2) return "grid-cell cell-meal";
    return "grid-cell cell-busy";
  };

  return (
    <div className="schedule-container">
      <h1>Weekly Availability</h1>
      <p className="subtitle">
        Click to toggle:
        <span style={{ margin: "0 8px" }}>⬜ Busy</span>
        <span style={{ margin: "0 8px" }}>🟩 Free</span>
        <span style={{ margin: "0 8px" }}>🟧 Meal</span>
      </p>

      {userId ? (
        <div className="schedule-grid">
          {/* 1. Header Row: Empty corner + Days */}
          <div className="grid-header" style={{ background: "#555" }}>
            Time
          </div>
          {DAYS.map((day) => (
            <div key={day} className="grid-header">
              {day}
            </div>
          ))}

          {/* 2. Body Rows: Time Label + 7 Cells */}
          {HOURS.map((hourLabel, hIndex) => (
            <React.Fragment key={hIndex}>
              {/* Time Label Column */}
              <div className="time-label">{hourLabel}</div>

              {/* Day Columns for this Hour */}
              {DAYS.map((_, dIndex) => (
                <div
                  key={`${dIndex}-${hIndex}`}
                  className={getCellClass(grid[dIndex][hIndex])}
                  onClick={() => handleCellClick(dIndex, hIndex)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div
          className="grid-cell"
          style={{ padding: "20px", textAlign: "center", cursor: "default" }}
        >
          Please log in to edit your schedule.
        </div>
      )}

      {userId && (
        <div style={{ textAlign: "center" }}>
          <button className="save-button" onClick={handleSave}>
            Save Schedule
          </button>
          {saveMessage && (
            <div style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedule;
