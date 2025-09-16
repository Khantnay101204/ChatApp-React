import { useState } from "react";
import "./App.css";

import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import ProtectedRoute from "./util/ProtectedRoute";
import isTokenValid from "./util/isTokenValid";
import Login from "./Login/LoginPage";
import Home from "./Home/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectLogin />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function RedirectLogin() {
  return isTokenValid() ? <Navigate to="/home" replace /> : <Login />;
}

export default App;
