import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authColors } from "../colors/colors";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const c = authColors;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    navigate("/");
  };

  return (
    <div className="relative w-full">

      {/* Navbar */}
      <nav
        className="w-full shadow-md px-4 py-3 flex items-center justify-between relative z-50"
        style={{ backgroundColor: c.ambientGree }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">
            FleetFlow
          </h1>
        </div>

        {/* Right Avatar */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold cursor-pointer hover:scale-105 transition"
          >
            U
          </div>

          {/* Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">
                  Username
                </p>
                <p className="text-xs text-slate-400">
                  user@example.com
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}