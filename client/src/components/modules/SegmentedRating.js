import React from "react";
import "./SegmentedRating.css";

/**
 * A "Loading Bar" style rating input.
 *
 * Props:
 * @param {number} value - Current value (1-5)
 * @param {function} onChange - Callback when clicked (returns new value)
 * @param {string} label - Text label (e.g. "Sports Interest")
 * @param {string} color - CSS color for the "filled" state (default: blue)
 */
const SegmentedRating = ({ value, onChange, label, color = "#007bff" }) => {
  return (
    <div className="rating-container">
      <div className="rating-label-row">
        <span className="rating-label">{label}</span>
        <span className="rating-value-text">{value}/5</span>
      </div>

      <div className="rating-bar">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`rating-segment ${index <= value ? "filled" : "empty"}`}
            onClick={() => onChange(index)}
            style={{ backgroundColor: index <= value ? color : "#e0e0e0" }}
          />
        ))}
      </div>

      {/* Optional: Add labels for min/max vibe */}
      <div className="rating-footer">
        <span className="footer-text">Low</span>
        <span className="footer-text">High</span>
      </div>
    </div>
  );
};

export default SegmentedRating;
