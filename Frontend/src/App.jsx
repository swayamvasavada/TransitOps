import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import TripDispatchPage from "./pages/TripDispatchPage";
import Maintenance from "./pages/Maintenance";
import TripandExpScreen from "./pages/TripandExpScreen";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import VehicleRegistry from "./pages/VehicleRegistry";
import Loader from "./components/Loader";
import useGlobalLoading from "./hooks/useGlobalLoading";
// import SignUp from "./pages/SignUp";

function AppContent() {
  const globalLoading = useGlobalLoading();
  return (
    <>
      <Loader show={globalLoading} text="Please wait" />
      {/* <div className="flex min-h-screen"> */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignUp />} /> */}
        <Route path="/reset-password/:token" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicle-registry" element={<VehicleRegistry />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trip-dispatcher" element={<TripDispatchPage />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/fuel-expense" element={<TripandExpScreen />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
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
