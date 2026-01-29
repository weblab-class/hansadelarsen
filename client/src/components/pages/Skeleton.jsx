import React, { useContext, useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import "../../utilities.css";
import "./Skeleton.css";
import { UserContext } from "../App";
import Game from "./Game";
import Leaderboard from "./Leaderboard";
import HowToPlay from "./HowToPlay";

const Skeleton = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);

  const [view, setView] = useState("MENU");

  if (view === "GAME") {
    return <Game stopGame={() => setView("MENU")} />;
  }

  if (view === "LEADERBOARD") {
    return <Leaderboard goBack={() => setView("MENU")} />;
  }

  if (view === "HOWTOPLAY") {
    return <HowToPlay goBack={() => setView("MENU")} />;
  }

  return (
    <div className="landing-container">
      <h1 className="game-title">Quest Collecter</h1>

      <div className="auth-section">
        {userId ? (
          <div className="welcome-message">
            <p>Thanks for logging In!</p>
            <button
              className="btn-logout"
              onClick={() => {
                googleLogout();
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
        )}
      </div>

      <hr className="divider" />

      <div className="menu-section">
        {userId ? (
          <button className="btn-primary" onClick={() => setView("GAME")}>
            START GAME
          </button>
        ) : (
          <button className="btn-disabled" disabled>
            Login to Start
          </button>
        )}
      </div>

      <div className="menu-section">
        <button className="btn-secondary" onClick={() => setView("HOWTOPLAY")}>
          HOW TO PLAY
        </button>
      </div>

      <div className="menu-section">
        <button className="btn-secondary" onClick={() => setView("LEADERBOARD")}>
          LEADERBOARD
        </button>
      </div>
    </div>
  );
};

export default Skeleton;
