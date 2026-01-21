import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { UserContext } from "../App";
import "./NavBar.css";

const NavBar = () => {
  const { userId, handleLogin, handleLogout } = useContext(UserContext);
  const location = useLocation(); // Gets the current URL path
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to determine Page Title based on URL
  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Home";
      case "/profile":
        return "My Profile";
      case "/schedule":
        return "Schedule";
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
        {userId ? (
          <>
            {/* A. Hamburger Menu (First) */}
            <button
              className="hamburger-btn"
              onClick={toggleMenu}
              style={{ marginRight: "20px" }} // Adds space between menu and profile
            >
              ☰
            </button>

            {/* B. Profile Icon (Second) */}
            <Link to="/profile" className="nav-profile-pic" title="Go to Profile">
              👤
            </Link>

            {/* C. The Dropdown (Only visible if menuOpen is true) */}
            {menuOpen && (
              <div className="nav-dropdown">
                <Link to="/about" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
                  About
                </Link>
                <Link to="/" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <Link
                  to="/quest-share"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Quest Share
                </Link>

                {/* Logout Option */}
                <div
                  className="nav-dropdown-link"
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </div>
              </div>
            )}
          </>
        ) : (
          /* If Logged Out: Show Google Login Button */
          <div className="auth-container">
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
