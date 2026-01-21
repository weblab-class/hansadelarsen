import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom"; // <--- MUST BE OUTLET
import { googleLogout } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

import NavBar from "./modules/NavBar";
import "../utilities.css";
import { get, post } from "../utilities";

export const UserContext = createContext(null);

const App = () => {
  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
    googleLogout();
  };

  const authContextValue = { userId, handleLogin, handleLogout };

  return (
    <UserContext.Provider value={authContextValue}>
      <NavBar />
      <div className="App-container">
        <Outlet />
      </div>
    </UserContext.Provider>
  );
};

export default App;
