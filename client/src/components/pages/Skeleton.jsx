import React, { useContext, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { get } from "../../utilities";
import "./Skeleton.css";

const Home = () => {
  const { userId, handleLogin } = useContext(UserContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      get("/api/whoami").then((u) => setUser(u));
    }
  }, [userId]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // --- LOGGED OUT VIEW ---
  if (!userId) {
    return (
      <div className="home-container">
        {/* BUBBLE 1: Header & Login */}
        <div className="bubble-card landing-header">
          <h1 className="landing-title">Welcome to QuestFinder</h1>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>Sync your life. Find new experiences.</p>
          <div className="auth-wrapper">
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
          </div>
        </div>

        {/* BUBBLE 2: What is QuestFinder? */}
        <div className="bubble-card info-bubble">
          <h2 className="info-heading">🗺️ What is QuestFinder?</h2>
          <p className="info-text">
            QuestFinder is a tool that makes spending free time more exciting! Simply fill in a
            weekly schedule with your available free time and QuestFinder will come up with
            potential "side quests" you can go on to spend your time. And, with{" "}
            <strong>QuestShare</strong>, you can use your free time to connect with other users,
            making it incredibly easy to find new friends and spend time with other people with
            similar interests!
          </p>
        </div>

        {/* BUBBLE 3: How does QuestShare Work? */}
        <div className="bubble-card info-bubble">
          <h2 className="info-heading">⚔️ How does QuestShare Work?</h2>
          <p className="info-text">
            QuestShare works by pairing users with public accounts together for side quests that fit
            each party's schedule. While on the side quest, users are encouraged to take pictures
            and share their quest on the QuestShare public forum, offering personal anecdotes and
            accounts of venues, events, and activities for all users to engage with.
          </p>
        </div>
      </div>
    );
  }

  // --- LOGGED IN VIEW ---
  return (
    <div className="home-container">
      {/* BUBBLE 1: Header */}
      <div className="bubble-card dashboard-header-bubble">
        <h1 className="greeting">
          {getTimeGreeting()}, {user?.firstName || "Traveler"}!
        </h1>
        <div className="date-display">{todayDate}</div>
      </div>

      {/* GRID OF BUBBLE BUTTONS */}
      <div className="action-grid">
        <Link to="/schedule" className="dashboard-btn btn-schedule">
          <span className="btn-icon">📅</span>
          <span className="btn-title">My Schedule</span>
          <span className="btn-desc">Manage your weekly availability.</span>
        </Link>

        <Link to="/quest-share" className="dashboard-btn btn-quest">
          <span className="btn-icon">⚔️</span>
          <span className="btn-title">Quest Share</span>
          <span className="btn-desc">Find friends and go on adventures.</span>
        </Link>

        <Link to="/profile" className="dashboard-btn btn-profile">
          <span className="btn-icon">👤</span>
          <span className="btn-title">My Profile</span>
          <span className="btn-desc">Update your details & preferences.</span>
        </Link>

        <Link to="/history" className="dashboard-btn btn-history">
          <span className="btn-icon">📜</span>
          <span className="btn-title">History</span>
          <span className="btn-desc">View your past logs.</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
