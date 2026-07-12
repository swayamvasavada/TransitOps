import { useState } from "react";
import Navbar from "../components/Navbar";
// import Search from "../components/Search";
// import NewTripModal from "../Modal/NewTripForm";
// import VehicleForm from "../Modal/VehicleForm";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);

  const [vehicleType, setVehicleType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [region, setRegion] = useState("All");

  // Mock data for trips
  const allTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min", region: "West", type: "Van" },
    { id: "TR002", vehicle: "TRK-12", driver: "Jake", status: "Completed", eta: "--", region: "North", type: "Truck" },
    { id: "TR003", vehicle: "MINI-09", driver: "Priya", status: "Dispatched", eta: "1h 10m", region: "East", type: "Mini" },
    { id: "TR004", vehicle: "--", driver: "--", status: "Draft", eta: "Awaiting vehicle", region: "South", type: "--" },
  ];

  // Filter trips based on search input and filter dropdowns
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

  // Fleet-wide stats (mock)
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
    { label: "Available", value: 42, max: 53, color: "bg-emerald-500" },
    { label: "On Trip", value: 18, max: 53, color: "bg-blue-500" },
    { label: "In Shop", value: 5, max: 53, color: "bg-amber-500" },
    { label: "Not Avail", value: 2, max: 53, color: "bg-rose-400" },
  ];

  const statusStyles = {
    "On Trip": "bg-blue-100 text-blue-700 border-blue-300",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Dispatched: "bg-sky-100 text-sky-700 border-sky-300",
    Draft: "bg-slate-100 text-slate-500 border-slate-300",
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <Navbar />

      <div className="py-6 px-4 sm:px-6 lg:px-8 w-full space-y-6">

        {/* Toolbar */}
        

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-4">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
            Filters
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <FilterSelect
              label="Vehicle Type"
              value={vehicleType}
              onChange={setVehicleType}
              options={["All", "Van", "Truck", "Mini"]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", "On Trip", "Completed", "Dispatched", "Draft"]}
            />
            <FilterSelect
              label="Region"
              value={region}
              onChange={setRegion}
              options={["All", "North", "South", "East", "West"]}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard title="Active Vehicles" value={stats.activeVehicles} color="blue" />
          <StatCard title="Available Vehicles" value={stats.availableVehicles} color="emerald" />
          <StatCard title="Vehicles in Maintenance" value={String(stats.vehiclesInMaintenance).padStart(2, "0")} color="amber" />
          <StatCard title="Active Trips" value={stats.activeTrips} color="blue" />
          <StatCard title="Previous Trips" value={String(stats.previousTrips).padStart(2, "0")} color="blue" />
          <StatCard title="Drivers on Duty" value={stats.driversOnDuty} color="blue" />
          <StatCard title="Fleet Utilization" value={`${stats.fleetUtilization}%`} color="emerald" />
        </div>

        {/* Table + Vehicle Status */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table Section */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                {search
                  ? `Search Results (${filteredTrips.length})`
                  : "Recent Trips"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50">
                    {["Trip", "Vehicle", "Driver", "Status", "ETA"].map((h) => (
                      <th key={h} className="px-8 py-4 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((trip, i) => (
                      <tr
                        key={i}
                        className={`border-b border-slate-50 hover:bg-teal-50/40 transition ${
                          i % 2 === 0 ? "" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-8 py-5 text-slate-400 font-mono text-xs">
                          {trip.id}
                        </td>
                        <td className="px-8 py-5 font-semibold text-slate-800">
                          {trip.vehicle}
                        </td>
                        <td className="px-8 py-5 text-slate-600">
                          {trip.driver}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium border ${statusStyles[trip.status]}`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 text-xs">
                          {trip.eta}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-8 text-center text-slate-400"
                      >
                        No trips found matching "{search}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Status Panel */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-5">
              Vehicle Status
            </h2>
            <div className="space-y-4">
              {vehicleStatus.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 shrink-0">
                    {row.label}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${(row.value / row.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-6 text-right shrink-0">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Trip Modal */}
      {showTripModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowTripModal(false)
          }
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-base">
                New Trip Registration
              </h2>
              <button
                onClick={() => setShowTripModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              <NewTripModal
                onSave={() => setShowTripModal(false)}
                onCancel={() => setShowTripModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowVehicleModal(false)
          }
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-base">
                New Vehicle Registration
              </h2>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              <VehicleForm
                onSave={() => setShowVehicleModal(false)}
                onCancel={() => setShowVehicleModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, color }) {
  const colors = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 hover:scale-[1.02] transition">
      <h3 className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold leading-tight">
        {title}
      </h3>
      <p className={`mt-2 text-2xl font-bold ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <span className="text-xs text-slate-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}