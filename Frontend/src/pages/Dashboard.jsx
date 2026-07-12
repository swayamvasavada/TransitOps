import { useState } from "react";
import Navbar from "../components/Navbar";
import Search from "../components/Search";
// import NewTripModal from "../Modal/NewTripForm";
// import VehicleForm from "../Modal/VehicleForm";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);

  // Mock data for trips
  const allTrips = [
    { id: "TR-100", vehicle: "MH 04 AB 1230", driver: "John Doe", status: "On Trip" },
    { id: "TR-101", vehicle: "MH 04 AB 1231", driver: "Jane Smith", status: "Completed" },
    { id: "TR-102", vehicle: "MH 04 AB 1232", driver: "Robert Johnson", status: "On Trip" },
    { id: "TR-103", vehicle: "MH 04 AB 1233", driver: "Sarah Williams", status: "Pending" },
    { id: "TR-104", vehicle: "MH 04 AB 1234", driver: "Michael Brown", status: "Completed" },
    { id: "TR-104", vehicle: "MH 04 AB 1234", driver: "Michael Brown", status: "Completed" },
    { id: "TR-104", vehicle: "MH 04 AB 1234", driver: "Michael Brown", status: "Completed" },
  ];

  // Filter trips based on search input
  const filteredTrips = allTrips.filter((trip) => {
    const searchLower = search.toLowerCase();
    return (
      trip.id.toLowerCase().includes(searchLower) ||
      trip.vehicle.toLowerCase().includes(searchLower) ||
      trip.driver.toLowerCase().includes(searchLower) ||
      trip.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* <Navbar /> */}

      <div className="py-6 px-4 sm:px-6 lg:px-8 w-full space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setShowTripModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 active:scale-95 transition shadow"
            >
              New Trip
            </button>

            <button
              onClick={() => setShowVehicleModal(true)}
              className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 active:scale-95 transition shadow"
            >
              New Vehicle
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Active Fleet"
            value={filteredTrips.filter((t) => t.status === "On Trip").length}
            color="emerald"
          />
          <StatCard
            title="Maintenance Alert"
            value={filteredTrips.filter((t) => t.status === "Pending").length}
            color="amber"
          />
          <StatCard
            title="Pending Cargo"
            value={filteredTrips.length}
            color="blue"
          />
        </div>

        {/* Table Section */}
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
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
                  {["Trip ID", "Vehicle", "Driver", "Status"].map((h) => (
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
                          className={`text-xs px-2 py-1 rounded-full font-medium border ${
                            trip.status === "On Trip"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : trip.status === "Completed"
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
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

/* ================= COMPONENT ================= */

function StatCard({ title, value, color }) {
  const colors = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 hover:scale-[1.02] transition">
      <h3 className="text-sm uppercase tracking-widest text-slate-400 font-semibold">
        {title}
      </h3>
      <p className={`mt-4 text-4xl font-bold ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}