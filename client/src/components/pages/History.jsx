import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { get } from "../../utilities";
import "./Schedule.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// MATCHING THE NEW SCHEDULE FORMAT
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

  // --- STATE CORRECTION ---
  useEffect(() => {
    if (selectedYear === realCurrentYear && selectedMonth > realCurrentMonth) {
      setSelectedMonth(realCurrentMonth);
    }
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
    if (val === 3) return "grid-cell cell-quest";
    return "grid-cell cell-busy";
  };

  const isBeforeCutoff = currentWeekStart < CUTOFF_DATE;

  return (
    <div className="schedule-page-wrapper">
      {/* --- LEFT COLUMN: HISTORY GRID --- */}
      <div className="schedule-left-column">
        <h1 style={{ marginBottom: "16px", marginTop: 0 }}>Schedule History</h1>

        {/* CONTROLS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            background: "white",
            padding: "10px 16px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            alignItems: "center",
          }}
        >
          <button className="nav-arrow" onClick={handlePrevWeek}>
            &#9664;
          </button>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#666" }}>Year</label>
            <input
              type="number"
              value={selectedYear}
              max={realCurrentYear}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val <= realCurrentYear) setSelectedYear(val);
              }}
              style={{
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "60px",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#666" }}>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minWidth: "100px",
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

          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#666" }}>Week Of</label>
            <select
              value={safeIndex}
              onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
              style={{
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%",
              }}
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

          <button
            className="nav-arrow"
            onClick={handleNextWeek}
            disabled={isFuture}
            style={{ opacity: isFuture ? 0.3 : 1, cursor: isFuture ? "default" : "pointer" }}
          >
            &#9654;
          </button>
        </div>

        <p className="subtitle" style={{ marginTop: 0, marginBottom: "16px" }}>
          {isBeforeCutoff
            ? "No records exist before Jan 1, 2026."
            : "Viewing historic record (Read Only)."}
        </p>

        {/* THE GRID */}
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

            {HOURS.map((hourObj, hIndex) => (
              <React.Fragment key={hIndex}>
                {/* NEW VERTICAL TIME LABEL */}
                <div className="time-label">
                  <span className="time-start">{hourObj.start}</span>
                  <span className="time-end">{hourObj.end}</span>
                </div>

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

      {/* --- RIGHT COLUMN: SUMMARY / PLACEHOLDER --- */}
      <div className="schedule-right-column">
        <div className="quest-feed-header">
          <h3 style={{ margin: 0, color: "#777" }}>Weekly Summary</h3>
        </div>
        <div style={{ color: "#999", textAlign: "center", marginTop: "40px", fontStyle: "italic" }}>
          Detailed quest logs for past weeks are archived. <br />
          (This area mimics the layout of the main schedule page)
        </div>
      </div>
    </div>
  );
};

export default History;
