import React, { useState, useEffect, createContext } from "react";
import { Routes, Route } from "react-router-dom"; // removed BrowserRouter here since index.js usually handles it
import { googleLogout } from "@react-oauth/google";

import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound";
import Skeleton from "./pages/Skeleton";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import NavBar from "./modules/NavBar"; // <--- IMPORT THE NAVBAR

import "../utilities.css";

import { get, post } from "../utilities";

// Create the Context so NavBar and Pages can share data
export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the db, and currently logged in
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
    googleLogout(); // Clean up Google session
  };

  // Group the auth data to pass down
  const authContextValue = {
    userId,
    handleLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      {/* 1. NAVBAR GOES HERE - Visible on all pages */}
      <NavBar />

      {/* 2. PAGES GO HERE - Changes based on URL */}
      <div className="App-container">
        <Routes>
          <Route path="/" element={<Skeleton userId={userId} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </UserContext.Provider>
  );
};

export default App;
