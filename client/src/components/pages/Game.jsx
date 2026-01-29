import React, { useState, useEffect, useRef } from "react";
import { post } from "../../utilities";
import "./Game.css";

const Game = (props) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerIndex, setPlayerIndex] = useState(1); // 0=Left, 1=Middle, 2=Right

  const [papers, setPapers] = useState([]);
  const [spawnRate, setSpawnRate] = useState(1000);

  const playerRef = useRef(playerIndex);
  const platforms = [0, 1, 2];

  useEffect(() => {
    playerRef.current = playerIndex;
  }, [playerIndex]);

  //built in native keyboard controls for playing
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        setPlayerIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "ArrowRight") {
        setPlayerIndex((prev) => (prev < 2 ? prev + 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  //implementation of countdown timer
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      // Send score to database
      post("/api/score", { score: score }).then(() => {
        //console.log("Score saved!");
      });

      alert(`GAME OVER! Final Score: ${score}`);
      props.stopGame();
    }
  }, [timeLeft]);

  //falling paper generator
  useEffect(() => {
    if (timeLeft === 0) return;

    const spawner = setInterval(() => {
      const newPaper = {
        id: Date.now(),
        lane: Math.floor(Math.random() * 3),
        top: 0,
      };
      setPapers((prev) => [...prev, newPaper]);
    }, spawnRate);

    return () => clearInterval(spawner);
  }, [spawnRate, timeLeft]);

  //falling paper movement and collection mechanism
  useEffect(() => {
    if (timeLeft === 0) return;

    const gameLoop = setInterval(() => {
      setPapers((currentPapers) => {
        return (
          currentPapers
            //moves papers down the screen
            .map((paper) => ({ ...paper, top: paper.top + 2 }))
            //creates a "hit box" for the player to catch papers and logs points for catches
            .filter((paper) => {
              if (paper.top > 85 && paper.top < 95 && paper.lane === playerRef.current) {
                handleCatch(); //helper defined later
                return false;
              }
              //if papers go off screen, papers are also removed but no points scored
              if (paper.top > 100) return false;

              //keeps papers in all other cases
              return true;
            })
        );
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [timeLeft]);

  //counts the papers caught, and increases speed over time
  const handleCatch = () => {
    setScore((prevScore) => {
      const newScore = prevScore + 1;
      if (newScore % 3 === 0) {
        //speed is capped at 200 because anything faster gave me a seizure
        setSpawnRate((prevRate) => Math.max(200, prevRate - 100));
      }
      return newScore;
    });
  };

  const moveLeft = () => setPlayerIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const moveRight = () => setPlayerIndex((prev) => (prev < 2 ? prev + 1 : prev));

  return (
    <div className="game-container">
      <div className="hud-container">
        <div className="score-board">SCORE: {score}</div>
        <div className="timer">TIME: {timeLeft}</div>
      </div>
      <div className="world-container">
        {platforms.map((index) => (
          <div key={index} className="platform-lane">
            {papers.map((paper) => {
              if (paper.lane === index) {
                return (
                  <div key={paper.id} className="falling-paper" style={{ top: `${paper.top}%` }}>
                    📄
                  </div>
                );
              }
              return null;
            })}
            {playerIndex === index && <div className="player-avatar">You</div>}

            <div className="platform-base"></div>
          </div>
        ))}
      </div>
      {/*on screen arrow buttons (allows for mobile phone use)*/}
      <div className="controls-container">
        <button className="arrow-btn left-arrow" onClick={moveLeft}>
          ←
        </button>
        <button className="arrow-btn right-arrow" onClick={moveRight}>
          →
        </button>
      </div>
      <button className="quit-btn" onClick={props.stopGame}>
        Quit Game
      </button>
    </div>
  );
};
export default Game;
