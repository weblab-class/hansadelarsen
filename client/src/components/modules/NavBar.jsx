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
            <button className="hamburger-btn" onClick={toggleMenu} style={{ marginRight: "20px" }}>
              ☰
            </button>

            {/* B. Profile Icon (Second) */}
            <Link to="/profile" className="nav-profile-pic" title="Go to Profile">
              👤
            </Link>

            {/* C. The Dropdown */}
            {/* C. The Dropdown */}
            {menuOpen && (
              <div className="nav-dropdown">
                {/* 1. About */}
                <Link to="/about" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
                  About
                </Link>

                {/* 2. Home */}
                <Link to="/" className="nav-dropdown-link" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>

                {/* 3. Schedule (MAKE SURE THIS IS HERE) */}
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

                {/* 4. Quest Share */}
                <Link
                  to="/quest-share"
                  className="nav-dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Quest Share
                </Link>

                {/* 5. Logout */}
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
          <div className="auth-container">
            <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
