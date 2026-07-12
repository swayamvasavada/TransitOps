import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Truck, Navigation, Wrench, DollarSign, TrendingUp, PieChart, Settings, User } from "lucide-react";
import useAuthStore from "../store/AuthStore";

// Local palette fallback so Sidebar doesn't depend on external color file.
const c = {
  panel: "#0d1220",
  surface: "#141c30",
  textPrimary: "#eef1f8",
  textMuted: "#8891ab",
  amber: "#ffb020",
  teal: "#2dd4bf",
};

export default function Sidebar({ isOpen, onLogout }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || "Guest";
  const userEmail = user?.email || "";

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate("/");
  };

  const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicle Registry", path: "/vehicle-registry", icon: Truck },
  { label: "Drivers", path: "/drivers", icon: User },
  { label: "Trip Dispatcher", path: "/trip-dispatcher", icon: Navigation },
  { label: "Maintenance", path: "/maintenance", icon: Wrench },
  { label: "Fuel & Expense", path: "/fuel-expense", icon: DollarSign },
  // { label: "Performance", path: "/performance", icon: TrendingUp },
  { label: "Analytics", path: "/analytics", icon: PieChart },
  { label: "Settings", path: "/settings", icon: Settings },
];

  return (
    <div
      className={`fixed left-0 transition-transform duration-300 z-50 flex flex-col top-[64px] w-64 shadow-lg ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{ backgroundColor: c.surface, height: 'calc(100vh - 64px)' }}
    >
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto p-3 space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-[rgba(255,255,255,0.02)]"
            style={{ alignItems: 'center' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${c.amber}14`, border: `1.5px solid ${c.amber}55` }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-[3px] w-4 h-4">
                <div className="rounded-[2px]" style={{ background: c.amber }} />
                <div className="rounded-[2px]" style={{ background: c.teal || '#2dd4bf' }} />
                <div className="rounded-[2px]" style={{ background: c.teal || '#2dd4bf' }} />
                <div className="rounded-[2px]" style={{ background: c.amber }} />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>TransitOps</div>
            </div>
          </button>

          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              label={item.label}
              path={item.path}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
          <div className="px-1">
            <div className="rounded-lg p-3" style={{ background: c.surfaceRaised, border: `1px solid rgba(255,255,255,0.02)` }}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: `linear-gradient(135deg, ${c.teal}, ${c.amber})`, color: c.panel }}>
                    {userName.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: c.textPrimary }}>{userName}</div>
                  <div className="text-xs truncate" style={{ color: c.textMuted }}>{userEmail}</div>
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm" style={{ background: 'transparent', color: c.textMuted, border: `1px solid rgba(255,255,255,0.02)` }}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ label, path, icon: Icon }) {
  return (
    <NavLink to={path} className={`flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.02)]`}>
      {({ isActive }) => (
        <>
          {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: isActive ? c.amber : c.textMuted }} />}
          <span style={{ color: isActive ? c.textPrimary : c.textMuted, fontWeight: isActive ? 700 : 500 }}>{label}</span>
        </>
      )}
    </NavLink>
  );
}