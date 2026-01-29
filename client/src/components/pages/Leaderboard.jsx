import React, { useState, useEffect } from "react";
import { get } from "../../utilities";
import "./Leaderboard.css";

const Leaderboard = (props) => {
  const [scores, setScores] = useState([]);

  // grabs the scores from the backend and loads them into the leaderboard for display
  useEffect(() => {
    get("/api/scores").then((data) => {
      setScores(data);
    });
  }, []);

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">LEADERBOARD</h1>

      <div className="scores-list">
        <div className="score-row header">
          <span className="rank-col">#</span>
          <span className="name-col">NAME</span>
          <span className="score-col">SCORE</span>
        </div>
        {scores.map((scoreObj, index) => (
          <div key={index} className="score-row">
            <span className="rank-col">{index + 1}</span>
            <span className="name-col">{scoreObj.name}</span>
            <span className="score-col">{scoreObj.score}</span>
          </div>
        ))}

        {scores.length === 0 && <div className="loading-text">Loading scores...</div>}
      </div>

      <button className="back-btn" onClick={props.goBack}>
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
