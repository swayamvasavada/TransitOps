import { NavLink, useNavigate } from "react-router-dom";
import { authColors } from "../colors/colors";
import { LogOut, LayoutDashboard, Truck, Navigation, Wrench, DollarSign, TrendingUp, PieChart } from "lucide-react";

export default function Sidebar({ isOpen }) {
  const c = authColors;
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
      className={`absolute left-0 top-full w-64 shadow-lg transition-transform duration-300 z-40 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ backgroundColor: "white" }}
    >
      <div className="flex flex-col p-6 space-y-6">
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
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 cursor-pointer hover:translate-x-1 transition ${
          isActive
            ? "text-black font-bold"
            : "text-gray-700 hover:text-black"
        }`
      }
    >
      {Icon && <Icon size={20} strokeWidth={1.5} />}
      {label}
    </NavLink>
  );
}