import { useState, useRef } from "react";
import { Menu, X, Search } from "lucide-react";
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

export default function Navbar({
  userName = "Raven K.",
  userRole = "Dispatcher",
  userEmail = "raven.k@transitops.in",
  onSearch,
  searchPlaceholder = "Search...",
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // profile UI moved to sidebar

  // (profile moved to sidebar)

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
    if (onLogout) onLogout();
    else navigate("/");
  };

  return (
    <div className="w-full">
      <nav
        className="fixed top-0 left-0 w-full px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-3 z-50 border-b justify-between"
        style={{
          backgroundColor: c.bg,
          borderColor: c.borderSoft,
          backdropFilter: "saturate(120%) blur(6px)",
        }}
      >
        {/* Left — menu toggle + brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md transition cursor-pointer"
            style={{ color: c.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.background = c.surface)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* <h1
            className="hidden sm:block text-lg font-bold tracking-tight"
            style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            TransitOps
          </h1> */}

          {/* Center — search */}
          <div className="flex-1 min-w-0">
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
        </div>

        {/* profile moved to sidebar */}
      </nav>

      {/* spacer so page content sits below fixed navbar */}
      <div style={{ height: 64 }} aria-hidden />

      {/* Sidebar (pass user info so profile lives there) */}
      <Sidebar isOpen={isOpen} userName={userName} userRole={userRole} userEmail={userEmail} onLogout={handleLogout} />

      <style>{`
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
