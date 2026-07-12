import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Truck, Navigation, Wrench, DollarSign, TrendingUp, PieChart } from "lucide-react";

// Local palette fallback so Sidebar doesn't depend on external color file.
const c = {
  panel: "#0d1220",
  surface: "#141c30",
  textPrimary: "#eef1f8",
  textMuted: "#8891ab",
  amber: "#ffb020",
};

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicle Registry", path: "/vehicle-registry", icon: Truck },
  { label: "Trip Dispatcher", path: "/trip-dispatcher", icon: Navigation },
  { label: "Maintenance", path: "/maintenance", icon: Wrench },
  { label: "Trip & Expense", path: "/trip-expense", icon: DollarSign },
  { label: "Performance", path: "/performance", icon: TrendingUp },
  { label: "Analytics", path: "/analytics", icon: PieChart },
];

  return (
    <div
      className={`fixed left-0 transition-transform duration-300 z-50 flex flex-col h-100px top-[64px] w-64 shadow-lg ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{ backgroundColor: c.surface }}
    >
      <div className="flex flex-col p-3 space-y-6">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
          />
        ))}
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