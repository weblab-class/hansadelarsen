import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./components/App";
import Skeleton from "./components/pages/Skeleton";
import NotFound from "./components/pages/NotFound";
import Profile from "./components/pages/Profile";
import Schedule from "./components/pages/Schedule";
import History from "./components/pages/History";

const GOOGLE_CLIENT_ID = "683928089193-dr9ot0qlnslqbl900muqnpcohvrglua9.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
      <Route path="/" element={<Skeleton />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/history" element={<History />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
