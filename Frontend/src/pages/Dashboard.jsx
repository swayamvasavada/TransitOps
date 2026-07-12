import { useState } from "react";
import {
  Truck,
  CircleCheck,
  Wrench,
  Users,
  Gauge,
  ListChecks,
  History,
  ChevronDown,
} from "lucide-react";
import Navbar from "../components/Navbar";
// import NewTripModal from "../Modal/NewTripForm";
// import VehicleForm from "../Modal/VehicleForm";

// ---------------------------------------------------------------------------
// Design tokens — same dispatch-console palette as the login screen:
// near-black chassis, signal-amber primary accent, per-role "line colors".
// ---------------------------------------------------------------------------
const c = {
  bg: "#0a0e17",
  bgVignette:
    "radial-gradient(ellipse at 20% 0%, rgba(255,176,32,0.07) 0%, transparent 45%), radial-gradient(ellipse at 85% 90%, rgba(45,212,191,0.06) 0%, transparent 45%)",
  surface: "#111726",
  surfaceRaised: "#141c30",
  panel: "#0d1220",
  border: "#212c45",
  borderSoft: "#1a2238",
  borderStrong: "#2e3c5e",
  textPrimary: "#eef1f8",
  textSecondary: "#8891ab",
  textMuted: "#525c79",
  amber: "#ffb020",
  amberSoft: "rgba(255,176,32,0.12)",
  teal: "#2dd4bf",
  rose: "#fb7185",
  violet: "#a78bfa",
  error: "#fb6474",
  errorBg: "rgba(251,100,116,0.08)",
  errorBorder: "rgba(251,100,116,0.35)",
  success: "#34d399",
};

const STATUS_META = {
  "On Trip": { color: c.teal, icon: Truck },
  Completed: { color: c.success, icon: CircleCheck },
  Dispatched: { color: c.amber, icon: ListChecks },
  Draft: { color: c.textMuted, icon: History },
};

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);

  const [vehicleType, setVehicleType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [region, setRegion] = useState("All");

  const allTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min", region: "West", type: "Van" },
    { id: "TR002", vehicle: "TRK-12", driver: "Jake", status: "Completed", eta: "--", region: "North", type: "Truck" },
    { id: "TR003", vehicle: "MINI-09", driver: "Priya", status: "Dispatched", eta: "1h 10m", region: "East", type: "Mini" },
    { id: "TR004", vehicle: "--", driver: "--", status: "Draft", eta: "Awaiting vehicle", region: "South", type: "--" },
  ];

  const filteredTrips = allTrips.filter((trip) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      trip.id.toLowerCase().includes(searchLower) ||
      trip.vehicle.toLowerCase().includes(searchLower) ||
      trip.driver.toLowerCase().includes(searchLower) ||
      trip.status.toLowerCase().includes(searchLower);
    const matchesType = vehicleType === "All" || trip.type === vehicleType;
    const matchesStatus = statusFilter === "All" || trip.status === statusFilter;
    const matchesRegion = region === "All" || trip.region === region;
    return matchesSearch && matchesType && matchesStatus && matchesRegion;
  });

  const stats = {
    activeVehicles: 53,
    availableVehicles: 42,
    vehiclesInMaintenance: 5,
    activeTrips: 18,
    previousTrips: 9,
    driversOnDuty: 26,
    fleetUtilization: 81,
  };

  const vehicleStatus = [
    { label: "Available", value: 42, max: 53, color: c.success },
    { label: "On Trip", value: 18, max: 53, color: c.teal },
    { label: "In Shop", value: 5, max: 53, color: c.amber },
    { label: "Not Avail", value: 2, max: 53, color: c.rose },
  ];

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: c.bg, fontFamily: "'Inter', ui-sans-serif, system-ui" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        input::placeholder { color: #4a5372; }
        select { color-scheme: dark; }
      `}</style>

      {/* Ambient vignette + grid, matching the login page */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: c.bgVignette }} />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="py-6 px-4 sm:px-6 lg:px-8 w-full space-y-6">
          {/* Filters */}
          <div
            className="rounded-2xl px-6 py-4"
            style={{ background: c.surface, border: `1px solid ${c.border}` }}
          >
            <p
              className="text-[11px] font-semibold uppercase mb-3"
              style={{ color: c.textMuted, letterSpacing: "0.12em" }}
            >
              Filters
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <FilterSelect label="Vehicle Type" value={vehicleType} onChange={setVehicleType} options={["All", "Van", "Truck", "Mini"]} />
              <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "On Trip", "Completed", "Dispatched", "Draft"]} />
              <FilterSelect label="Region" value={region} onChange={setRegion} options={["All", "North", "South", "East", "West"]} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            <StatCard title="Active Vehicles" value={stats.activeVehicles} color={c.amber} icon={Truck} />
            <StatCard title="Available Vehicles" value={stats.availableVehicles} color={c.success} icon={CircleCheck} />
            <StatCard title="Vehicles in Maintenance" value={String(stats.vehiclesInMaintenance).padStart(2, "0")} color={c.rose} icon={Wrench} />
            <StatCard title="Active Trips" value={stats.activeTrips} color={c.teal} icon={ListChecks} />
            <StatCard title="Previous Trips" value={String(stats.previousTrips).padStart(2, "0")} color={c.violet} icon={History} />
            <StatCard title="Drivers on Duty" value={stats.driversOnDuty} color={c.amber} icon={Users} />
            <StatCard title="Fleet Utilization" value={`${stats.fleetUtilization}%`} color={c.success} icon={Gauge} />
          </div>

          {/* Table + Vehicle Status */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Table Section */}
            <div
              className="xl:col-span-2 rounded-2xl overflow-hidden"
              style={{ background: c.surface, border: `1px solid ${c.border}` }}
            >
              <div className="px-8 py-5" style={{ borderBottom: `1px solid ${c.borderSoft}`, background: c.panel }}>
                <h2
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: c.textMuted, letterSpacing: "0.12em" }}
                >
                  {search ? `Search Results (${filteredTrips.length})` : "Recent Trips"}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.borderSoft}`, background: c.panel }}>
                      {["Trip", "Vehicle", "Driver", "Status", "ETA"].map((h) => (
                        <th
                          key={h}
                          className="px-8 py-4 text-left text-[11px] font-semibold uppercase"
                          style={{ color: c.textMuted, letterSpacing: "0.1em" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTrips.length > 0 ? (
                      filteredTrips.map((trip, i) => {
                        const meta = STATUS_META[trip.status];
                        const Icon = meta.icon;
                        return (
                          <tr
                            key={i}
                            className="transition"
                            style={{ borderBottom: `1px solid ${c.borderSoft}` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="px-8 py-5 text-xs" style={{ color: c.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                              {trip.id}
                            </td>
                            <td className="px-8 py-5 font-semibold" style={{ color: c.textPrimary }}>
                              {trip.vehicle}
                            </td>
                            <td className="px-8 py-5" style={{ color: c.textSecondary }}>
                              {trip.driver}
                            </td>
                            <td className="px-8 py-5">
                              <span
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{ color: meta.color, background: `${meta.color}1f`, border: `1px solid ${meta.color}55` }}
                              >
                                <Icon size={11} strokeWidth={2.5} />
                                {trip.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-xs" style={{ color: c.textMuted }}>
                              {trip.eta}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-8 text-center" style={{ color: c.textMuted }}>
                          No trips found matching "{search}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Status Panel */}
            <div className="rounded-2xl p-6" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <h2
                className="text-[11px] font-semibold uppercase mb-5"
                style={{ color: c.textMuted, letterSpacing: "0.12em" }}
              >
                Vehicle Status
              </h2>
              <div className="space-y-4">
                {vehicleStatus.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-xs w-20 shrink-0" style={{ color: c.textSecondary }}>
                      {row.label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: c.panel }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(row.value / row.max) * 100}%`,
                          background: row.color,
                          boxShadow: `0 0 8px ${row.color}66`,
                        }}
                      />
                    </div>
                    <span className="text-xs w-6 text-right shrink-0" style={{ color: c.textMuted }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 pt-5 flex items-center gap-2 text-[11px] font-mono uppercase"
                style={{ borderTop: `1px solid ${c.borderSoft}`, color: c.textMuted, letterSpacing: "0.1em" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: c.success, animation: "blink 2s ease-in-out infinite" }}
                />
                Fleet feed live
              </div>
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}
        {showTripModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowTripModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
              style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${c.borderSoft}` }}>
                <h2 className="font-bold text-base" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
                  New Trip Registration
                </h2>
                <button
                  onClick={() => setShowTripModal(false)}
                  className="text-xl font-bold cursor-pointer"
                  style={{ color: c.textMuted }}
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-5">
                <NewTripModal onSave={() => setShowTripModal(false)} onCancel={() => setShowTripModal(false)} />
              </div>
            </div>
          </div>
        )}

        {showVehicleModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowVehicleModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
              style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${c.borderSoft}` }}>
                <h2 className="font-bold text-base" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
                  New Vehicle Registration
                </h2>
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="text-xl font-bold cursor-pointer"
                  style={{ color: c.textMuted }}
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-5">
                <VehicleForm onSave={() => setShowVehicleModal(false)} onCancel={() => setShowVehicleModal(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, color, icon: Icon }) {
  return (
    <div
      className="rounded-xl px-4 py-4 transition"
      style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-[10px] uppercase font-semibold leading-tight max-w-[80%]"
          style={{ color: c.textMuted, letterSpacing: "0.08em" }}
        >
          {title}
        </h3>
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${color}1f`, border: `1px solid ${color}55` }}
        >
          <Icon size={12} style={{ color }} strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 relative"
      style={{ background: c.panel, border: `1px solid ${c.border}` }}
    >
      <span className="text-xs" style={{ color: c.textMuted }}>
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium outline-none cursor-pointer pr-5 appearance-none"
        style={{ color: c.textPrimary }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: c.surfaceRaised, color: c.textPrimary }}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-3 pointer-events-none" style={{ color: c.textMuted }} />
    </div>
  );
}