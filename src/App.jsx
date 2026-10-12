import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./Pages/UserDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/user-dashboard"
            element={<UserDashboard />}
          />
        </Route>

        {/* Invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;