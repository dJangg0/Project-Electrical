import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/login";
import Dashboard from "./components/dashboard"; // Admin UI
import MobileUI from "./components/mobileUI"; // Mobile UI
import "./App.css";

const App = () => {
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(
    localStorage.getItem("userRole") as "admin" | "user" | null
  );

  useEffect(() => {
    if (userRole) {
      localStorage.setItem("userRole", userRole);
    }
  }, [userRole]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={setUserRole} />} />
        <Route path="/dashboard" element={userRole === "admin" ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/mobile-ui" element={userRole === "user" ? <MobileUI /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
