import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../App";
import { get } from "../../utilities";
import "./Schedule.css"; // Reuse the exact same CSS

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

const History = () => {
  const { userId } = useContext(UserContext);

  // --- STATE ---
  // Default to current date
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // Index of the week within that month

  // Data State
  const [recurringSchedule, setRecurringSchedule] = useState(
    Array(7)
      .fill(null)
      .map(() => Array(16).fill(0))
  );
  const [specificWeeks, setSpecificWeeks] = useState({});

  // --- HELPERS: Calculate Weeks in a Month ---
  const getWeeksInMonth = (year, month) => {
    const weeks = [];

    // Start at the 1st of the month
    let date = new Date(year, month, 1);

    // Adjust to find the Monday of that week (even if it's in the previous month)
    // If the 1st is a Tuesday (2), we go back 1 day to Monday.
    const day = date.getDay() || 7; // Sunday=7
    date.setDate(date.getDate() - day + 1);

    // Now iterate forward adding 7 days until we are fully into the NEXT month
    // We stop when the Monday is in the next month
    while (date.getMonth() <= month || (date.getMonth() > month && date.getFullYear() < year)) {
      // Edge case for December to January transition
      if (date.getFullYear() > year) break;
      if (date.getFullYear() === year && date.getMonth() > month) break;

      weeks.push(new Date(date)); // Store the Monday date object
      date.setDate(date.getDate() + 7);
    }
    return weeks;
  };

  const weeksList = getWeeksInMonth(selectedYear, selectedMonth);

  // Ensure selectedWeekIndex is valid when month changes
  useEffect(() => {
    setSelectedWeekIndex(0);
  }, [selectedYear, selectedMonth]);

  // --- GET DATA FOR CURRENT VIEW ---
  const currentWeekStart = weeksList[selectedWeekIndex] || new Date();
  const currentWeekId = currentWeekStart.toDateString();

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
  // If specific data existed for that past week, use it. Otherwise use template.
  let displayGrid = recurringSchedule;
  if (specificWeeks[currentWeekId]) {
    displayGrid = specificWeeks[currentWeekId];
  }

  const getCellClass = (val) => {
    if (val === 1) return "grid-cell cell-free";
    if (val === 2) return "grid-cell cell-meal";
    return "grid-cell cell-busy";
  };

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
        }}
      >
        {/* YEAR SELECTOR */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>Year</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* WEEK SELECTOR */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#666" }}>Week Of</label>
          <select
            value={selectedWeekIndex}
            onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value))}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }}
          >
            {weeksList.map((date, i) => {
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
      </div>

      <p className="subtitle">
        Viewing historic record. <span style={{ color: "#777" }}>Read Only.</span>
      </p>

      {/* --- THE GRID (ALWAYS DISABLED/GRAY) --- */}
      {userId ? (
        <div className="schedule-grid disabled" style={{ border: "2px solid #ccc" }}>
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
                  // No onClick handler here (It's read only)
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
