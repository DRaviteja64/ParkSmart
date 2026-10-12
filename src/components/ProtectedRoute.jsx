import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();

  let loggedInUser = null;

  // Read the logged-in user from sessionStorage
  try {
    const storedUser = sessionStorage.getItem("loggedInUser");

    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Error reading logged-in user:",
      error
    );

    // Remove invalid session data
    sessionStorage.removeItem("loggedInUser");
  }

  // Verify that a valid user ID exists
  const isAuthenticated =
    loggedInUser !== null &&
    typeof loggedInUser === "object" &&
    loggedInUser.userId !== null &&
    loggedInUser.userId !== undefined &&
    String(loggedInUser.userId).trim() !== "";

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Allow authenticated users to access protected routes
  return <Outlet />;
}