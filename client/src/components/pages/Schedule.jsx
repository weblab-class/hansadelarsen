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
  const [weekOffset, setWeekOffset] = useState(0);

  // --- STATE ---
  const [recurringSchedule, setRecurringSchedule] = useState(
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(0))
  );
  const [specificWeeks, setSpecificWeeks] = useState({});
  const [isRecurringMode, setIsRecurringMode] = useState(true);

  // --- DATE HELPERS ---
  const getWeekStart = (offset) => {
    const current = new Date();
    const day = current.getDay() || 7;
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - day + 1);
    startOfWeek.setDate(startOfWeek.getDate() + offset * 7);
    return startOfWeek;
  };

  const getWeekId = (offset) => {
    return getWeekStart(offset).toDateString();
  };

  const getWeekRangeString = (offset) => {
    const start = getWeekStart(offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const options = { month: "short", day: "numeric" };
    const year =
      start.getFullYear() !== end.getFullYear()
        ? `, ${end.getFullYear()}`
        : `, ${start.getFullYear()}`;
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}${year}`;
  };

  const getDateForColumn = (offset, colIndex) => {
    const start = getWeekStart(offset);
    const target = new Date(start);
    target.setDate(start.getDate() + colIndex);
    return target.getDate();
  };

  const getWeekStatusLabel = (offset) => {
    if (offset < 0) return "Past Week (Read Only)";
    if (offset === 0) return "Current Week";
    if (offset === 1) return "Next Week";
    return `${offset} Weeks Ahead`;
  };

  // --- FETCH DATA ---
  useEffect(() => {
    if (userId) {
      get("/api/whoami").then((user) => {
        if (user.schedule && user.schedule.length === 7) {
          setRecurringSchedule(user.schedule);
        }
        if (user.specificWeeks) {
          setSpecificWeeks(user.specificWeeks);
        }
      });
    }
  }, [userId]);

  // --- VIEW LOGIC ---
  const currentWeekId = getWeekId(weekOffset);
  let displayGrid = recurringSchedule;
  if (specificWeeks[currentWeekId]) {
    displayGrid = specificWeeks[currentWeekId];
  }

  // --- HANDLERS ---
  const handleCellClick = (dayIndex, hourIndex) => {
    if (weekOffset < 0) return; // Block Past Edits

    let newGrid = displayGrid.map((row) => [...row]);
    const currentVal = newGrid[dayIndex][hourIndex];
    newGrid[dayIndex][hourIndex] = (currentVal + 1) % 3;

    if (isRecurringMode) {
      setRecurringSchedule(newGrid);
    } else {
      setSpecificWeeks((prev) => ({
        ...prev,
        [currentWeekId]: newGrid,
      }));
    }
  };

  const handleSave = () => {
    if (weekOffset < 0) return;

    let payload = {};
    if (isRecurringMode) {
      const hasFutureData = Object.keys(specificWeeks).length > 0;
      if (hasFutureData) {
        const confirmOverwrite = window.confirm(
          "⚠️ Warning: Saving this Recurring Schedule will overwrite your future specific plans.\nContinue?"
        );
        if (!confirmOverwrite) return;
      }
      payload = { schedule: recurringSchedule, specificWeeks: {} };
      setSpecificWeeks({});
    } else {
      payload = { specificWeeks: specificWeeks };
    }

    post("/api/schedule", payload).then(() => {
      setSaveMessage(isRecurringMode ? "✅ Saved!" : "✅ Saved!");
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  const getCellClass = (val) => {
    if (val === 1) return "grid-cell cell-free";
    if (val === 2) return "grid-cell cell-meal";
    return "grid-cell cell-busy";
  };

  const isPast = weekOffset < 0;

  return (
    <div className="schedule-container">
      {/* 1. DATE NAV */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
        <button
          className="nav-arrow"
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={weekOffset <= -2}
          style={{ opacity: weekOffset <= -2 ? 0.3 : 1 }}
        >
          &#9664;
        </button>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, minWidth: "300px" }}>{getWeekRangeString(weekOffset)}</h1>
          <div
            className="week-status-badge"
            style={{
              backgroundColor: isPast ? "#e0e0e0" : "#e3f2fd",
              color: isPast ? "#757575" : "#1976d2",
            }}
          >
            {getWeekStatusLabel(weekOffset)}
          </div>
        </div>

        <button
          className="nav-arrow"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 3}
          style={{ opacity: weekOffset >= 3 ? 0.3 : 1 }}
        >
          &#9654;
        </button>
      </div>

      {/* 2. CONTROLS AREA (Toggle + Save Button) */}
      {!isPast && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          {/* The Toggle */}
          <div
            className="mode-toggle-container"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fff",
              padding: "8px 20px",
              borderRadius: "30px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <span
              style={{
                fontWeight: isRecurringMode ? "bold" : "normal",
                color: isRecurringMode ? "#333" : "#aaa",
                fontSize: "0.9rem",
              }}
            >
              🔄 Recurring
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={!isRecurringMode}
                onChange={() => setIsRecurringMode(!isRecurringMode)}
              />
              <span className="slider round"></span>
            </label>
            <span
              style={{
                fontWeight: !isRecurringMode ? "bold" : "normal",
                color: !isRecurringMode ? "#333" : "#aaa",
                fontSize: "0.9rem",
              }}
            >
              📅 Specific
            </span>
          </div>

          {/* The Save Button (Moved Here) */}
          <div style={{ height: "40px", marginTop: "8px" }}>
            {userId && (
              <>
                <button
                  className="save-button"
                  onClick={handleSave}
                  style={{ backgroundColor: isRecurringMode ? "#333" : "#2196f3" }}
                >
                  {isRecurringMode ? "Save Recurring" : "Save Specific"}
                </button>
                {saveMessage && (
                  <span
                    style={{
                      marginLeft: "10px",
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    {saveMessage}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTITLE */}
      <p className="subtitle">
        {isPast ? (
          <span style={{ color: "#777" }}>Historic data is read-only.</span>
        ) : isRecurringMode ? (
          "Editing General Availability (Applies to all future weeks)"
        ) : (
          `Editing ONLY the week of ${getWeekRangeString(weekOffset)}`
        )}
      </p>

      {/* 4. THE GRID */}
      {userId ? (
        <div
          className={`schedule-grid ${isPast ? "disabled" : ""}`}
          style={{
            border: isPast
              ? "2px solid #ccc"
              : isRecurringMode
                ? "2px solid #333"
                : "2px solid #2196f3",
          }}
        >
          <div
            className="grid-header"
            style={{ background: isPast ? "#777" : isRecurringMode ? "#555" : "#1976d2" }}
          >
            Time
          </div>
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="grid-header"
              style={{ background: isPast ? "#777" : isRecurringMode ? "#333" : "#1565c0" }}
            >
              {day}{" "}
              <span style={{ fontWeight: "normal", fontSize: "0.9em" }}>
                {getDateForColumn(weekOffset, index)}
              </span>
            </div>
          ))}

          {HOURS.map((hourLabel, hIndex) => (
            <React.Fragment key={hIndex}>
              <div className="time-label">{hourLabel}</div>
              {DAYS.map((_, dIndex) => (
                <div
                  key={`${dIndex}-${hIndex}`}
                  className={getCellClass(displayGrid[dIndex][hIndex])}
                  onClick={() => handleCellClick(dIndex, hIndex)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div>Please log in.</div>
      )}
    </div>
  );
};

export default Schedule;
