import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { get } from "../../utilities";
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CUTOFF_DATE = new Date("2026-01-01");

const History = () => {
  const { userId } = useContext(UserContext);

  // --- REAL TIME CONSTANTS ---
  const today = new Date();
  const realCurrentYear = today.getFullYear();
  const realCurrentMonth = today.getMonth();

  // Calculate the "Real" Current Monday to stop future navigation
  const dayOfWeek = today.getDay() || 7;
  const realCurrentMonday = new Date(today);
  realCurrentMonday.setDate(today.getDate() - dayOfWeek + 1);
  realCurrentMonday.setHours(0, 0, 0, 0);

  // --- STATE ---
  const [selectedYear, setSelectedYear] = useState(realCurrentYear);
  const [selectedMonth, setSelectedMonth] = useState(realCurrentMonth);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const [recurringSchedule, setRecurringSchedule] = useState(
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(0))
  );
  const [specificWeeks, setSpecificWeeks] = useState({});

  // --- HELPER: Get Weeks in Month ---
  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    let date = new Date(year, month, 1);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);

    while (date.getMonth() <= month || (date.getMonth() > month && date.getFullYear() < year)) {
      if (date.getFullYear() > year) break;
      if (date.getFullYear() === year && date.getMonth() > month) break;
      weeks.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }
    return weeks;
  };

  const weeksList = getWeeksInMonth(selectedYear, selectedMonth);

  // --- STATE CORRECTION (THE FIX) ---
  useEffect(() => {
    // 1. CONSTRAINT: If we switched to current year, but the old month is in the future...
    if (selectedYear === realCurrentYear && selectedMonth > realCurrentMonth) {
      // Snap back to the real current month
      setSelectedMonth(realCurrentMonth);
    }

    // 2. ALWAYS reset to the first week when context changes
    setSelectedWeekIndex(0);
  }, [selectedYear, selectedMonth]);

  // --- ARROW HANDLERS ---
  const handlePrevWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    } else {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear = selectedYear - 1;
      }

      const prevMonthWeeks = getWeeksInMonth(newYear, newMonth);
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
      setSelectedWeekIndex(prevMonthWeeks.length - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeekIndex < weeksList.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    } else {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;

      if (newMonth > 11) {
        newMonth = 0;
        newYear = selectedYear + 1;
      }

      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
      setSelectedWeekIndex(0);
    }
  };

  // --- DERIVED VIEW DATA ---
  const safeIndex = Math.min(selectedWeekIndex, weeksList.length - 1);
  const currentWeekStart = weeksList[safeIndex] || new Date();
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekId = currentWeekStart.toDateString();

  // Can we go forward?
  const nextWeekCheck = new Date(currentWeekStart);
  nextWeekCheck.setDate(nextWeekCheck.getDate() + 7);
  const isFuture = nextWeekCheck > realCurrentMonday;

  const getDateForColumn = (colIndex) => {
    const target = new Date(currentWeekStart);
    target.setDate(target.getDate() + colIndex);
    return target.getDate();
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
  const emptyGrid = Array(7)
    .fill(null)
    .map(() => Array(16).fill(0));
  let displayGrid = recurringSchedule;

  if (currentWeekStart < CUTOFF_DATE) {
    displayGrid = emptyGrid;
  } else if (specificWeeks[currentWeekId]) {
    displayGrid = specificWeeks[currentWeekId];
  }

  const getCellClass = (val) => {
    if (val === 1) return "grid-cell cell-free";
    if (val === 2) return "grid-cell cell-meal";
    return "grid-cell cell-busy";
  };

  const isBeforeCutoff = currentWeekStart < CUTOFF_DATE;

  return (
    <div className="schedule-container">
      <h1 style={{ marginBottom: "16px" }}>Schedule History</h1>

      {/* --- HISTORY CONTROLS --- */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          background: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          alignItems: "center",
        }}
      >
        {/* PREV ARROW */}
        <button className="nav-arrow" onClick={handlePrevWeek}>
          &#9664;
        </button>

        {/* YEAR SELECTOR */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>Year</label>
          <input
            type="number"
            value={selectedYear}
            max={realCurrentYear}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val <= realCurrentYear) setSelectedYear(val);
            }}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "80px" }}
          />
        </div>

        {/* MONTH SELECTOR */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minWidth: "120px",
            }}
          >
            {MONTHS.map((m, i) => {
              if (selectedYear === realCurrentYear && i > realCurrentMonth) return null;
              return (
                <option key={m} value={i}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>

        {/* WEEK SELECTOR */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>Week Of</label>
          <select
            value={safeIndex}
            onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }}
          >
            {weeksList.map((date, i) => {
              if (date > realCurrentMonday) return null;

              const end = new Date(date);
              end.setDate(date.getDate() + 6);
              return (
                <option key={i} value={i}>
                  {date.toLocaleDateString()} - {end.toLocaleDateString()}
                </option>
              );
            })}
          </select>
        </div>

        {/* NEXT ARROW */}
        <button
          className="nav-arrow"
          onClick={handleNextWeek}
          disabled={isFuture}
          style={{ opacity: isFuture ? 0.3 : 1, cursor: isFuture ? "default" : "pointer" }}
        >
          &#9654;
        </button>
      </div>

      <p className="subtitle">
        {isBeforeCutoff ? (
          <span>No records exist before Jan 1, 2026.</span>
        ) : (
          <span>
            Viewing historic record. <span style={{ color: "#777" }}>Read Only.</span>
          </span>
        )}
      </p>

      {/* --- THE GRID --- */}
      {userId ? (
        <div
          className="schedule-grid disabled"
          style={{ border: "2px solid #ccc", opacity: isBeforeCutoff ? 0.4 : 0.7 }}
        >
          <div className="grid-header" style={{ background: "#777" }}>
            Time
          </div>
          {DAYS.map((day, index) => (
            <div key={day} className="grid-header" style={{ background: "#777" }}>
              {day}{" "}
              <span style={{ fontWeight: "normal", fontSize: "0.9em" }}>
                {getDateForColumn(index)}
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

export default History;
