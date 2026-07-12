import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/Dashboard";
// import TripDispatchPage from "./pages/TripDispatchPage";
// import Maintenance from "./pages/Maintenance";
// import TripandExpScreen from "./pages/TripandExpScreen";
// import Performance from "./pages/Performance";
// import Analytics from "./pages/Analytics";
// import VehicleRegistry from "./pages/VehicleRegistry";
// import SignUp from "./pages/SignUp";

function AppContent() {
  return (
    <>
      {/* <div className="flex min-h-screen"> */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicle-registry" element={<VehicleRegistry />} />
        <Route path="/trip-dispatcher" element={<TripDispatchPage />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/trip-expense" element={<TripandExpScreen />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/analytics" element={<Analytics />} /> */}
      </Routes>
      {/* </div> */}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
