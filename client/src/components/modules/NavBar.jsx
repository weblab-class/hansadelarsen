import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./NavBar.css";

const NavBar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Home";
      case "/profile":
        return "My Profile";
      case "/schedule":
        return "Schedule";
      case "/history":
        return "History";
      case "/about":
        return "About";
      case "/quest-share":
        return "Quest Share";
      default:
        return "Orgomania";
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="NavBar-container">
      {/* 1. Left Aligned Title */}
      <h1 className="NavBar-title">{getPageTitle(location.pathname)}</h1>

      {/* 2. Right Side Controls */}
      <div className="NavBar-controls">
        {/* A. IF LOGGED IN: Show Profile Pic */}
        {userId && (
          <Link
            to="/profile"
            className="nav-profile-pic"
            title="Go to Profile"
            style={{ marginRight: "20px" }}
          >
            👤
          </Link>
        )}

        {/* B. IF LOGGED OUT: Show Google Login Button */}
        {!userId && (
          <div className="auth-container" style={{ marginRight: "20px" }}>
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
          </div>
        )}

        {/* C. HAMBURGER (ALWAYS VISIBLE) */}
        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
        </button>

        {/* D. DROPDOWN MENU */}
        {menuOpen && (
          <div className="nav-dropdown">
            {/* PUBLIC LINKS (Always visible) */}
            <Link to="/" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            <Link to="/about" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
              About
            </Link>

            {/* PROTECTED LINKS (Only if logged in) */}
            {userId && (
              <>
                <Link
                  to="/schedule"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Schedule
                </Link>

                <Link
                  to="/history"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  History
                </Link>

                <Link
                  to="/quest-share"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Quest Share
                </Link>

                <Link
                  to="/profile"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>

                {/* Logout Button */}
                <div
                  className="nav-dropdown-link"
                  style={{ color: "red", cursor: "pointer", borderTop: "1px solid #eee" }}
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
