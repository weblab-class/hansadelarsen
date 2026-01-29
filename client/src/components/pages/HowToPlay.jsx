import React from "react";
import "./Game.css"; // Reuse elements from the Game for consistency
import "./HowToPlay.css";

const HowToPlay = (props) => {
  // hardcoded player and platform states for visual effect
  const platforms = [0, 1, 2];
  const playerIndex = 1;

  // hardcoded fake falling papers added for visual effect
  const fakePapers = [
    { id: 1, lane: 0, top: 40 }, // Left lane, mid-air
    { id: 2, lane: 2, top: 70 }, // Right lane, lower down
  ];

  //Renders items from the "Game" with the instruction box overlay to simulate a tutorial screen"
  return (
    <div className="game-container blur-background">
      <div className="hud-container">
        <div className="score-board">SCORE: 0</div>
        <div className="timer">TIME: 30</div>
      </div>

      <div className="instruction-overlay">
        <div className="instruction-box">
          <h2>HOW TO PLAY</h2>
          <p>
            Side quests are falling from the sky! Control your character using your arrow keys or
            the arrow buttons on screen.
          </p>
          <p>
            Collect as many side quests as you can before the time runs out, and careful, the more
            you collect the faster it gets!
          </p>
          <button className="btn-primary" onClick={props.goBack}>
            GOT IT!
          </button>
        </div>
      </div>

      <div className="world-container">
        {platforms.map((index) => (
          <div key={index} className="platform-lane">
            {/* Render Static Papers */}
            {fakePapers.map((paper) => {
              if (paper.lane === index) {
                return (
                  <div key={paper.id} className="falling-paper" style={{ top: `${paper.top}%` }}>
                    📄
                  </div>
                );
              }
              return null;
            })}

            {playerIndex === index && <div className="player-avatar">Player</div>}

            <div className="platform-base"></div>
          </div>
        ))}
      </div>

      <div className="controls-container">
        <button className="arrow-btn left-arrow">←</button>
        <button className="arrow-btn right-arrow">→</button>
      </div>
    </div>
  );
};
export default HowToPlay;
