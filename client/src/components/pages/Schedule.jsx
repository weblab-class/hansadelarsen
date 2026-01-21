import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { get, post } from "../../utilities";
import { generateQuests } from "./QuestData";
import "./Schedule.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  { start: "8 AM", end: "9 AM" },
  { start: "9 AM", end: "10 AM" },
  { start: "10 AM", end: "11 AM" },
  { start: "11 AM", end: "12 PM" },
  { start: "12 PM", end: "1 PM" },
  { start: "1 PM", end: "2 PM" },
  { start: "2 PM", end: "3 PM" },
  { start: "3 PM", end: "4 PM" },
  { start: "4 PM", end: "5 PM" },
  { start: "5 PM", end: "6 PM" },
  { start: "6 PM", end: "7 PM" },
  { start: "7 PM", end: "8 PM" },
  { start: "8 PM", end: "9 PM" },
  { start: "9 PM", end: "10 PM" },
  { start: "10 PM", end: "11 PM" },
  { start: "11 PM", end: "12 AM" },
];

const Schedule = () => {
  const { userId } = useContext(UserContext);
  const [saveMessage, setSaveMessage] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  // --- DATA STATE ---
  const [recurringSchedule, setRecurringSchedule] = useState(
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(0))
  );
  const [specificWeeks, setSpecificWeeks] = useState({});

  // --- QUEST STATE ---
  const [allGeneratedQuests, setAllGeneratedQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [hoveredQuest, setHoveredQuest] = useState(null);

  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [tempGrid, setTempGrid] = useState(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);

  // --- DATE HELPERS ---
  const getWeekStart = (off) => {
    const current = new Date();
    const day = current.getDay() || 7;
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - day + 1 + off * 7);
    startOfWeek.setHours(0, 0, 0, 0); // Normalize time
    return startOfWeek;
  };

  const getWeekId = (off) => getWeekStart(off).toDateString();

  const getDateForColumn = (off, col) => {
    const start = getWeekStart(off);
    const target = new Date(start);
    target.setDate(start.getDate() + col);
    return target.getDate();
  };

  const getWeekRangeString = (off) => {
    const start = getWeekStart(off);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
  };

  const getWeekLabel = (off) => {
    if (off === 0) return { text: "Present Week", color: "#2196f3" };
    if (off === -1) return { text: "Last Week", color: "#777" };
    if (off === -2) return { text: "2 Weeks Ago", color: "#999" };
    if (off === 1) return { text: "Next Week", color: "#66bb6a" };
    return { text: `In ${off} Weeks`, color: "#ffa000" };
  };

  const jumpToToday = () => {
    setWeekOffset(0);
    setIsEditing(false);
  };

  // --- FETCH ---
  useEffect(() => {
    if (userId) {
      get("/api/whoami").then((user) => {
        if (user.schedule) setRecurringSchedule(user.schedule);
        if (user.specificWeeks) setSpecificWeeks(user.specificWeeks);
        setAllGeneratedQuests(generateQuests(user.preferences || {}));
      });
    }
  }, [userId]);

  // --- DISPLAY LOGIC ---
  const currentWeekId = getWeekId(weekOffset);
  const isPast = weekOffset < 0;
  const displayGrid = isEditing ? tempGrid : specificWeeks[currentWeekId] || recurringSchedule;

  // --- QUEST LOGIC ---
  useEffect(() => {
    if (!allGeneratedQuests.length) return;
    const validQuests = allGeneratedQuests.filter((quest) => {
      for (let h = 0; h < quest.duration; h++) {
        const hourIndex = quest.startHour + h;
        if (hourIndex >= 16) return false;
        const val = displayGrid[quest.day][hourIndex];
        if (val === 0 || val === 3) return false;
        if (val === 2 && quest.type !== "meal") return false;
      }
      return true;
    });
    setFilteredQuests(validQuests.sort((a, b) => b.matchPercent - a.matchPercent));
  }, [allGeneratedQuests, displayGrid]);

  // --- EDIT HANDLERS ---
  const handleEditToggle = () => {
    setTempGrid(JSON.parse(JSON.stringify(displayGrid)));
    setIsEditing(true);
    setShowOverwriteWarning(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowOverwriteWarning(false);
  };

  const handleClear = () => {
    // Resets the entire temporary grid to 0 (Busy)
    setTempGrid(
      Array(7)
        .fill(null)
        .map(() => Array(16).fill(0))
    );
  };

  const handleCellClick = (d, h) => {
    if (!isEditing || isPast) return;
    const nextGrid = tempGrid.map((row, rIdx) =>
      rIdx === d ? row.map((cell, cIdx) => (cIdx === h ? (cell + 1) % 3 : cell)) : row
    );
    setTempGrid(nextGrid);
  };

  // --- SAVE LOGIC 1: SPECIFIC ---
  const saveSpecific = () => {
    const updated = { ...specificWeeks, [currentWeekId]: tempGrid };
    setSpecificWeeks(updated);
    post("/api/schedule", { specificWeeks: updated }).then(() => {
      setSaveMessage("✅ Week Saved!");
      setIsEditing(false);
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  // --- SAVE LOGIC 2: RECURRING ---
  const initiateSaveRecurring = () => {
    const currentStart = getWeekStart(weekOffset);
    let hasFutureConflicts = false;

    // Check strict inequality: keyDate > currentWeekStart
    Object.keys(specificWeeks).forEach((weekKey) => {
      const weekDate = new Date(weekKey);
      // We only care about weeks strictly in the future relative to the one we are editing
      if (weekDate > currentStart) {
        hasFutureConflicts = true;
      }
    });

    if (hasFutureConflicts) {
      setShowOverwriteWarning(true);
    } else {
      performSaveRecurring();
    }
  };

  const performSaveRecurring = () => {
    const currentStart = getWeekStart(weekOffset);
    let newSpecificWeeks = { ...specificWeeks };

    // 1. FREEZE PAST: Keep history intact
    for (let i = -2; i < weekOffset; i++) {
      const pastWeekId = getWeekId(i);
      if (!newSpecificWeeks[pastWeekId]) {
        // If it was using the old template, save that state now
        newSpecificWeeks[pastWeekId] = recurringSchedule;
      }
    }

    // 2. WIPE FUTURE: Delete any overrides that are later than this week
    Object.keys(newSpecificWeeks).forEach((weekKey) => {
      const weekDate = new Date(weekKey);
      if (weekDate > currentStart) {
        delete newSpecificWeeks[weekKey];
      }
    });

    // 3. WIPE CURRENT: Remove the specific override for *this* week too,
    // since this week is becoming the new template source.
    if (newSpecificWeeks[currentWeekId]) {
      delete newSpecificWeeks[currentWeekId];
    }

    setRecurringSchedule(tempGrid);
    setSpecificWeeks(newSpecificWeeks);
    setIsEditing(false);
    setShowOverwriteWarning(false);

    post("/api/schedule", {
      schedule: tempGrid,
      specificWeeks: newSpecificWeeks,
    }).then(() => {
      setSaveMessage("🔄 Template Updated!");
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  return (
    <div className="schedule-page-wrapper">
      <div className="schedule-left-column">
        {/* Nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "800px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="nav-arrow"
              onClick={() => {
                setWeekOffset(weekOffset - 1);
                handleCancel();
              }}
              disabled={weekOffset <= -2}
            >
              &#9664;
            </button>
            <div style={{ textAlign: "center", minWidth: "180px" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: getWeekLabel(weekOffset).color,
                  textTransform: "uppercase",
                }}
              >
                {getWeekLabel(weekOffset).text}
              </span>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{getWeekRangeString(weekOffset)}</h2>
            </div>
            <button
              className="nav-arrow"
              onClick={() => {
                setWeekOffset(weekOffset + 1);
                handleCancel();
              }}
              disabled={weekOffset >= 3}
            >
              &#9654;
            </button>
            {!isEditing && weekOffset !== 0 && (
              <button className="today-btn" onClick={jumpToToday}>
                Today
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {saveMessage && (
              <span style={{ color: "green", fontWeight: "bold", fontSize: "0.85rem" }}>
                {saveMessage}
              </span>
            )}

            {!isPast &&
              (!isEditing ? (
                <button
                  className="save-button"
                  style={{ background: "#333" }}
                  onClick={handleEditToggle}
                >
                  ✏️ Edit Schedule
                </button>
              ) : (
                <>
                  {/* Warning State */}
                  {showOverwriteWarning ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#ffebee",
                        padding: "5px 10px",
                        borderRadius: "8px",
                        border: "1px solid #ef5350",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", color: "#c62828", fontWeight: "bold" }}>
                        Overwrite future changes?
                      </span>
                      <button
                        className="save-button"
                        style={{ background: "#ef5350", fontSize: "0.75rem", padding: "4px 8px" }}
                        onClick={performSaveRecurring}
                      >
                        Yes, Overwrite
                      </button>
                      <button
                        className="save-button"
                        style={{ background: "#333", fontSize: "0.75rem", padding: "4px 8px" }}
                        onClick={() => setShowOverwriteWarning(false)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    // Normal Edit State
                    <>
                      <button
                        className="save-button"
                        style={{
                          background: "#fff",
                          color: "#d32f2f",
                          border: "1px solid #d32f2f",
                        }}
                        onClick={handleClear}
                      >
                        🗑️ Clear
                      </button>
                      <button
                        className="save-button"
                        style={{ background: "#eee", color: "#333" }}
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        className="save-button"
                        style={{ background: "#2196f3" }}
                        onClick={saveSpecific}
                      >
                        Only This Week
                      </button>
                      <button
                        className="save-button"
                        style={{ background: "#333" }}
                        onClick={initiateSaveRecurring}
                      >
                        Save Recurring
                      </button>
                    </>
                  )}
                </>
              ))}
          </div>
        </div>

        {/* Grid */}
        <div
          className={`schedule-grid ${isPast ? "disabled" : ""} ${isEditing ? "editing-mode" : ""}`}
        >
          <div className="grid-header" style={{ background: "#555" }}>
            Time
          </div>
          {DAYS.map((day, idx) => (
            <div key={day} className="grid-header">
              {day}{" "}
              <span style={{ fontWeight: "normal", fontSize: "0.8em" }}>
                {getDateForColumn(weekOffset, idx)}
              </span>
            </div>
          ))}

          {HOURS.map((hour, hIdx) => (
            <React.Fragment key={hIdx}>
              <div className="time-label">
                <span className="time-start">{hour.start}</span>
                <span className="time-end">{hour.end}</span>
              </div>
              {DAYS.map((_, dIdx) => {
                const val = displayGrid[dIdx][hIdx];
                const highlighted =
                  hoveredQuest &&
                  dIdx === hoveredQuest.day &&
                  hIdx >= hoveredQuest.startHour &&
                  hIdx < hoveredQuest.startHour + hoveredQuest.duration;
                return (
                  <div
                    key={`${dIdx}-${hIdx}`}
                    className={`grid-cell ${highlighted ? "cell-highlight" : val === 1 ? "cell-free" : val === 2 ? "cell-meal" : val === 3 ? "cell-quest" : "cell-busy"}`}
                    onClick={() => handleCellClick(dIdx, hIdx)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="schedule-legend">
          <div className="legend-item">
            <div className="legend-box" style={{ background: "#66bb6a" }} /> Free
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ background: "#ffca28" }} /> Meal
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ background: "#2196f3" }} /> Quest
          </div>
          {isPast && (
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#999" }}>Read Only</span>
          )}
        </div>
      </div>

      {/* Right Column (Quests) */}
      <div className="schedule-right-column">
        <h3 style={{ marginTop: 0 }}>Available Quests</h3>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "20px" }}>
          Based on your free slots for this week.
        </p>
        <div className="quest-list">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className={`quest-card ${quest.type === "meal" ? "type-meal" : "type-activity"}`}
              onMouseEnter={() => setHoveredQuest(quest)}
              onMouseLeave={() => setHoveredQuest(null)}
            >
              <div className="quest-header">
                <span className="quest-title">{quest.title}</span>
                <span className="quest-score">{quest.matchPercent}%</span>
              </div>
              <div className="quest-time">
                📅 {DAYS[quest.day]} • ⏰ {HOURS[quest.startHour].start} -{" "}
                {HOURS[quest.startHour + quest.duration - 1].end}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
