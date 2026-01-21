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

  const [viewMode, setViewMode] = useState("available");
  const [ignoredQuestIds, setIgnoredQuestIds] = useState([]);
  const [acceptedQuestsByWeek, setAcceptedQuestsByWeek] = useState({});

  // FILTERS
  const [minCompatibility, setMinCompatibility] = useState(50);
  const [hideMeals, setHideMeals] = useState(false);

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
    startOfWeek.setHours(0, 0, 0, 0);
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
    setHoveredQuest(null);
  };

  const handleWeekChange = (direction) => {
    setWeekOffset(weekOffset + direction);
    handleCancel();
    setHoveredQuest(null);
  };

  const handleTabChange = (mode) => {
    setViewMode(mode);
    setHoveredQuest(null);
  };

  // --- FETCH ---
  // --- FETCH ---
  useEffect(() => {
    if (userId) {
      get("/api/whoami").then((user) => {
        // SAFETY CHECK: Only use the schedule if it has exactly 7 rows
        if (user.schedule && user.schedule.length === 7) {
          setRecurringSchedule(user.schedule);
        }

        if (user.specificWeeks) setSpecificWeeks(user.specificWeeks);
        if (user.acceptedQuestsByWeek) setAcceptedQuestsByWeek(user.acceptedQuestsByWeek);
        if (user.ignoredQuestIds) setIgnoredQuestIds(user.ignoredQuestIds);

        // Pass empty object if preferences are missing to prevent undefined errors
        setAllGeneratedQuests(generateQuests(user.preferences || {}));
      });
    }
  }, [userId]);

  // --- DISPLAY LOGIC ---
  const currentWeekId = getWeekId(weekOffset);
  const isPast = weekOffset < 0;
  const displayGrid = isEditing ? tempGrid : specificWeeks[currentWeekId] || recurringSchedule;

  const currentAccepted = acceptedQuestsByWeek[currentWeekId] || [];
  const currentIgnored = allGeneratedQuests.filter((q) => ignoredQuestIds.includes(q.id));

  const getTabBadge = (count) => {
    if (count > 9) return " (10+)";
    return ` (${count})`;
  };

  // --- QUEST FILTERING ---
  useEffect(() => {
    if (!allGeneratedQuests.length) return;

    const currentAcceptedIds = (acceptedQuestsByWeek[currentWeekId] || []).map((q) => q.id);

    const validQuests = allGeneratedQuests.filter((quest) => {
      // 1. Check Hide Meals
      if (hideMeals && quest.type === "meal") return false;

      // 2. Check Threshold
      if (quest.matchPercent < minCompatibility) return false;

      // 3. Exclude if ignored or accepted
      if (ignoredQuestIds.includes(quest.id)) return false;
      if (currentAcceptedIds.includes(quest.id)) return false;

      // 4. Check grid fit
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
  }, [
    allGeneratedQuests,
    displayGrid,
    ignoredQuestIds,
    acceptedQuestsByWeek,
    currentWeekId,
    minCompatibility,
    hideMeals,
  ]);

  // --- QUEST ACTIONS ---
  const handleAcceptQuest = (quest) => {
    let newGrid = JSON.parse(JSON.stringify(displayGrid));
    for (let i = 0; i < quest.duration; i++) {
      newGrid[quest.day][quest.startHour + i] = 3;
    }
    const previousAccepted = acceptedQuestsByWeek[currentWeekId] || [];
    const newAcceptedList = [...previousAccepted, quest];
    const updatedAcceptedMap = { ...acceptedQuestsByWeek, [currentWeekId]: newAcceptedList };

    setAcceptedQuestsByWeek(updatedAcceptedMap);
    const updatedSpecifics = { ...specificWeeks, [currentWeekId]: newGrid };
    setSpecificWeeks(updatedSpecifics);

    post("/api/schedule", {
      specificWeeks: updatedSpecifics,
      acceptedQuestsByWeek: updatedAcceptedMap,
    }).then(() => {
      setSaveMessage("🎉 Quest Accepted!");
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  const handleIgnoreQuest = (questId) => {
    const newIgnoredList = [...ignoredQuestIds, questId];
    setIgnoredQuestIds(newIgnoredList);
    setHoveredQuest(null);
    post("/api/schedule", { ignoredQuestIds: newIgnoredList });
  };

  const handleRestoreQuest = (questId) => {
    const newIgnoredList = ignoredQuestIds.filter((id) => id !== questId);
    setIgnoredQuestIds(newIgnoredList);
    post("/api/schedule", { ignoredQuestIds: newIgnoredList });
  };

  const handleUnacceptQuest = (quest) => {
    const currentList = acceptedQuestsByWeek[currentWeekId] || [];
    const newList = currentList.filter((q) => q.id !== quest.id);
    const updatedAcceptedMap = { ...acceptedQuestsByWeek, [currentWeekId]: newList };
    setAcceptedQuestsByWeek(updatedAcceptedMap);

    let newGrid = JSON.parse(JSON.stringify(displayGrid));
    for (let i = 0; i < quest.duration; i++) {
      newGrid[quest.day][quest.startHour + i] = quest.type === "meal" ? 2 : 1;
    }
    const updatedSpecifics = { ...specificWeeks, [currentWeekId]: newGrid };
    setSpecificWeeks(updatedSpecifics);

    post("/api/schedule", {
      specificWeeks: updatedSpecifics,
      acceptedQuestsByWeek: updatedAcceptedMap,
    });
  };

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

  // --- HELPER: REMOVE QUESTS THAT WERE OVERWRITTEN ---
  const cleanupInvalidQuests = (newGrid, weekId) => {
    const previouslyAccepted = acceptedQuestsByWeek[weekId] || [];
    // Keep only quests where the grid cells are still "3" (Quest)
    const validAccepted = previouslyAccepted.filter((quest) => {
      for (let i = 0; i < quest.duration; i++) {
        if (newGrid[quest.day][quest.startHour + i] !== 3) return false;
      }
      return true;
    });

    // If lists are different, return the cleaner list, else null
    if (validAccepted.length !== previouslyAccepted.length) return validAccepted;
    return null;
  };

  const saveSpecific = () => {
    // 1. Clean up ghosts
    const cleanedAcceptedList = cleanupInvalidQuests(tempGrid, currentWeekId);
    let updatedAcceptedMap = acceptedQuestsByWeek;

    if (cleanedAcceptedList) {
      updatedAcceptedMap = { ...acceptedQuestsByWeek, [currentWeekId]: cleanedAcceptedList };
      setAcceptedQuestsByWeek(updatedAcceptedMap);
    }

    // 2. Save
    const updatedSpecifics = { ...specificWeeks, [currentWeekId]: tempGrid };
    setSpecificWeeks(updatedSpecifics);

    post("/api/schedule", {
      specificWeeks: updatedSpecifics,
      acceptedQuestsByWeek: updatedAcceptedMap, // Send cleaned list
    }).then(() => {
      setSaveMessage("✅ Week Saved!");
      setIsEditing(false);
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  const initiateSaveRecurring = () => {
    const currentStart = getWeekStart(weekOffset);
    let hasFutureConflicts = false;
    Object.keys(specificWeeks).forEach((weekKey) => {
      if (new Date(weekKey) > currentStart) hasFutureConflicts = true;
    });
    if (hasFutureConflicts) setShowOverwriteWarning(true);
    else performSaveRecurring();
  };

  const performSaveRecurring = () => {
    const currentStart = getWeekStart(weekOffset);
    let newSpecificWeeks = { ...specificWeeks };

    // 1. Clean up ghosts for the CURRENT displayed week
    const cleanedAcceptedList = cleanupInvalidQuests(tempGrid, currentWeekId);
    let updatedAcceptedMap = { ...acceptedQuestsByWeek };

    if (cleanedAcceptedList) {
      updatedAcceptedMap[currentWeekId] = cleanedAcceptedList;
      setAcceptedQuestsByWeek(updatedAcceptedMap);
    }

    // 2. Handle future/past split
    for (let i = -2; i < weekOffset; i++) {
      const pastWeekId = getWeekId(i);
      if (!newSpecificWeeks[pastWeekId]) newSpecificWeeks[pastWeekId] = recurringSchedule;
    }

    Object.keys(newSpecificWeeks).forEach((weekKey) => {
      if (new Date(weekKey) > currentStart) delete newSpecificWeeks[weekKey];
    });

    if (newSpecificWeeks[currentWeekId]) delete newSpecificWeeks[currentWeekId];

    setRecurringSchedule(tempGrid);
    setSpecificWeeks(newSpecificWeeks);
    setIsEditing(false);
    setShowOverwriteWarning(false);

    post("/api/schedule", {
      schedule: tempGrid,
      specificWeeks: newSpecificWeeks,
      acceptedQuestsByWeek: updatedAcceptedMap,
    }).then(() => {
      setSaveMessage("🔄 Template Updated!");
      setTimeout(() => setSaveMessage(""), 2000);
    });
  };

  // --- RENDER HELPERS ---
  const renderQuestList = () => {
    if (viewMode === "available") {
      if (filteredQuests.length === 0)
        return <div className="empty-msg">No quests match filters or schedule.</div>;
      return filteredQuests.map((quest) => (
        <div
          key={quest.id}
          className={`quest-card ${quest.type === "meal" ? "type-meal" : "type-activity"}`}
          onMouseEnter={() => setHoveredQuest(quest)}
          onMouseLeave={() => setHoveredQuest(null)}
        >
          <div className="quest-header">
            <span className="quest-title">{quest.title}</span>
            <span className="quest-score">Compatibility: {quest.matchPercent}%</span>
          </div>
          <div className="quest-time">
            📅 {DAYS[quest.day]} • ⏰ {HOURS[quest.startHour].start} -{" "}
            {HOURS[quest.startHour + quest.duration - 1].end}
          </div>
          <div className="quest-actions">
            <button
              className="quest-btn btn-accept"
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptQuest(quest);
              }}
            >
              Accept
            </button>
            <button
              className="quest-btn btn-ignore"
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                handleIgnoreQuest(quest.id);
              }}
            >
              Ignore
            </button>
          </div>
        </div>
      ));
    }

    if (viewMode === "accepted") {
      if (currentAccepted.length === 0)
        return <div className="empty-msg">No quests accepted for this week yet.</div>;
      return currentAccepted.map((quest) => (
        <div
          key={quest.id}
          className="quest-card accepted-card"
          onMouseEnter={() => setHoveredQuest(quest)}
          onMouseLeave={() => setHoveredQuest(null)}
        >
          <div className="quest-header">
            <span className="quest-title">{quest.title}</span>
            <span className="accepted-badge">✓ Active</span>
          </div>
          <div className="quest-time">
            📅 {DAYS[quest.day]} • {HOURS[quest.startHour].start}
          </div>
          <button
            className="quest-btn btn-ignore"
            disabled={isEditing}
            onClick={(e) => {
              e.stopPropagation();
              handleUnacceptQuest(quest);
            }}
          >
            Cancel Quest
          </button>
        </div>
      ));
    }

    if (viewMode === "ignored") {
      if (currentIgnored.length === 0) return <div className="empty-msg">No ignored quests.</div>;
      return currentIgnored.map((quest) => (
        <div key={quest.id} className="quest-card ignored-card">
          <div className="quest-header">
            <span className="quest-title" style={{ color: "#999" }}>
              {quest.title}
            </span>
          </div>
          <button
            className="quest-btn btn-restore"
            disabled={isEditing}
            onClick={() => handleRestoreQuest(quest.id)}
          >
            Restore
          </button>
        </div>
      ));
    }
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
              onClick={() => handleWeekChange(-1)}
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
              onClick={() => handleWeekChange(1)}
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
                  {showOverwriteWarning ? (
                    <div className="overwrite-warning">
                      <span>Overwrite future?</span>
                      <button className="save-button warning-yes" onClick={performSaveRecurring}>
                        Yes
                      </button>
                      <button
                        className="save-button warning-no"
                        onClick={() => setShowOverwriteWarning(false)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button className="save-button btn-clear" onClick={handleClear}>
                        🗑️ Clear
                      </button>
                      <button className="save-button btn-cancel" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button className="save-button btn-specific" onClick={saveSpecific}>
                        Save for This Week
                      </button>
                      <button className="save-button btn-recurring" onClick={initiateSaveRecurring}>
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
            <div className="legend-box" style={{ background: "#ffca28" }} /> Meals Exclusively
          </div>
          <div className="legend-item">
            <div className="legend-box" style={{ background: "#2196f3" }} /> Quest
          </div>
          {isPast && (
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#999" }}>Read Only</span>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="schedule-right-column">
        {/* Tabs */}
        <div className="quest-tabs">
          <button
            className={`tab-btn ${viewMode === "available" ? "active" : ""}`}
            onClick={() => handleTabChange("available")}
          >
            Available
          </button>

          <button
            className={`tab-btn ${viewMode === "accepted" ? "active" : ""}`}
            onClick={() => handleTabChange("accepted")}
          >
            Accepted{getTabBadge(currentAccepted.length)}
          </button>

          <button
            className={`tab-btn ${viewMode === "ignored" ? "active" : ""}`}
            onClick={() => handleTabChange("ignored")}
          >
            Ignored{getTabBadge(currentIgnored.length)}
          </button>
        </div>

        {isEditing && (
          <div className="edit-mode-warning">⚠️ Finish editing before you accept quests!</div>
        )}

        {!isEditing && viewMode === "available" && (
          <div className="compatibility-controls">
            <label>
              Min Compatibility: <strong>{minCompatibility}%</strong>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minCompatibility}
              onChange={(e) => setMinCompatibility(Number(e.target.value))}
            />
            <label
              style={{
                marginTop: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="checkbox"
                checked={hideMeals}
                onChange={(e) => setHideMeals(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Hide Meal Options
            </label>
          </div>
        )}

        <div className="quest-list">{renderQuestList()}</div>
      </div>
    </div>
  );
};

export default Schedule;
