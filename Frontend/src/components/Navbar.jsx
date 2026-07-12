import { useState, useRef, useEffect } from "react";
import { Menu, X, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// ---------------------------------------------------------------------------
// Palette — kept local so this navbar is drop-in safe on any screen even if
// ../colors/colors doesn't export every token (that file was missing
// `ambientGree`, which silently broke the old background). Swap these for
// your real tokens if you want a single shared source of truth.
// ---------------------------------------------------------------------------
const c = {
  bg: "#0d1220",
  border: "#212c45",
  borderSoft: "#1a2238",
  surface: "#141c30",
  textPrimary: "#eef1f8",
  textSecondary: "#8891ab",
  textMuted: "#525c79",
  amber: "#ffb020",
  teal: "#2dd4bf",
  rose: "#fb7185",
  violet: "#a78bfa",
  error: "#fb6474",
};

// Role -> accent color, same mapping used across the app's RBAC surfaces.
const ROLE_COLORS = {
  "Fleet Manager": c.amber,
  Dispatcher: c.teal,
  "Safety Officer": c.rose,
  "Financial Analyst": c.violet,
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";
}

export default function Navbar({
  userName = "Raven K.",
  userRole = "Dispatcher",
  userEmail = "raven.k@transitops.in",
  onSearch,
  searchPlaceholder = "Search...",
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const roleColor = ROLE_COLORS[userRole] ?? c.amber;
  const initials = getInitials(userName);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search — fires onSearch 300ms after the user stops typing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch?.(value), 300);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch?.(query);
    }
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch?.("");
  };

  const handleLogout = () => {
    setShowProfile(false);
    if (onLogout) {
      onLogout();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full">
      <nav
        className="fixed top-0 left-0 w-full px-6 py-3 flex items-center gap-4 z-50 border-b"
        style={{ backgroundColor: c.bg, borderColor: c.borderSoft, backdropFilter: "saturate(120%) blur(6px)" }}
      >
        {/* Left — menu toggle + brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md transition cursor-pointer"
            style={{ color: c.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.background = c.surface)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1
            className="hidden sm:block text-lg font-bold tracking-tight"
            style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            TransitOps
          </h1>
        </div>

        {/* Center — search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: c.textMuted }}
            />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                background: c.surface,
                color: c.textPrimary,
                border: `1px solid ${c.border}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = `1px solid ${c.amber}`;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${c.amber}22`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = `1px solid ${c.border}`;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer"
                style={{ color: c.textMuted }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right — identity */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span
              className="hidden md:block text-sm font-medium"
              style={{ color: c.textPrimary }}
            >
              {userName}
            </span>

            {/* Role badge with overlapping avatar, matching the console look */}
            <span className="relative flex items-center">
              <span
                className="flex items-center pl-3 pr-8 py-1.5 rounded-full text-xs font-medium"
                style={{
                  color: roleColor,
                  background: `${roleColor}18`,
                  border: `1px solid ${roleColor}55`,
                }}
              >
                {userRole}
              </span>
              <span
                className="absolute -right-1 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                style={{
                  color: c.bg,
                  background: roleColor,
                  border: `2px solid ${c.bg}`,
                }}
              >
                {initials}
              </span>
            </span>

            <ChevronDown
              size={15}
              className="hidden md:block"
              style={{
                color: c.textMuted,
                transform: showProfile ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 160ms ease",
              }}
            />
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div
              className="absolute right-0 mt-3 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                boxShadow: "0 20px 45px rgba(0,0,0,0.55)",
                animation: "navFadeIn 150ms ease-out",
              }}
            >
              <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: c.borderSoft }}>
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0"
                  style={{ color: c.bg, background: roleColor }}
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: c.textPrimary }}>
                    {userName}
                  </p>
                  <p className="text-xs truncate" style={{ color: c.textMuted }}>
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 flex items-center gap-2 text-xs" style={{ color: c.textSecondary }}>
                <User size={13} style={{ color: roleColor }} />
                Role: <span style={{ color: roleColor }}>{userRole}</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-left px-4 py-3 text-sm transition cursor-pointer border-t"
                style={{ color: c.error, borderColor: c.borderSoft }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(251,100,116,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* spacer so page content sits below fixed navbar */}
      <div style={{ height: 64 }} aria-hidden />

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      <style>{`
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}