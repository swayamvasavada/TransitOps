import { useState, useMemo } from "react";
import { Check, X, AlertTriangle, CircleCheck } from "lucide-react";
import Navbar from "../components/Navbar";

// ---------------------------------------------------------------------------
// Same dark-console tokens as Navbar / VehicleRegistry / DriverSafetyProfiles.
// ---------------------------------------------------------------------------
const c = {
  bg: "#0a0e17",
  panel: "#0d1220",
  surface: "#111726",
  surfaceRaised: "#141c30",
  border: "#212c45",
  borderSoft: "#1a2238",
  borderStrong: "#2e3c5e",
  textPrimary: "#eef1f8",
  textSecondary: "#8891ab",
  textMuted: "#525c79",
  amber: "#ffb020",
  teal: "#2dd4bf",
  rose: "#fb7185",
  green: "#4ade80",
  blue: "#38bdf8",
};

// Trip lifecycle — one consistent color per stage, used by both the stepper
// and the live board badges.
const TRIP_STATUS = {
  Draft: {
    color: c.textSecondary,
    bg: "rgba(136,145,171,0.16)",
    border: "rgba(136,145,171,0.4)",
  },
  Dispatched: {
    color: c.blue,
    bg: "rgba(56,189,248,0.16)",
    border: "rgba(56,189,248,0.45)",
  },
  Completed: {
    color: c.green,
    bg: "rgba(74,222,128,0.16)",
    border: "rgba(74,222,128,0.45)",
  },
  Cancelled: {
    color: c.rose,
    bg: "rgba(251,113,133,0.18)",
    border: "rgba(251,113,133,0.45)",
  },
};
const LIFECYCLE_STAGES = ["Draft", "Dispatched", "Completed", "Cancelled"];

// Mock fleet/roster — in the real app these should come from VehicleRegistry
// and DriverSafetyProfiles state (or a shared API), filtered to Available.
const initialAvailableVehicles = [
  { id: "v1", label: "VAN-05 - 500 kg capacity", capacity: 500 },
  { id: "v2", label: "MINI-07 - 300 kg capacity", capacity: 300 },
];
const initialAvailableDrivers = [
  { id: "d1", label: "Alex" },
  { id: "d2", label: "Suresh" },
];

const initialTrips = [
  {
    id: "TR001",
    vehicle: "VAN-05",
    driver: "ALEX",
    source: "Gandhinagar Depot",
    destination: "Ahmedabad Hub",
    status: "Dispatched",
    note: "45 min",
  },
  {
    id: "TR004",
    vehicle: "TRUCK-04",
    driver: "SURESH",
    source: "Vatva Industrial Area",
    destination: "Sanand Warehouse",
    status: "Draft",
    note: "Awaiting driver",
  },
  {
    id: "TR006",
    vehicle: null,
    driver: null,
    source: "Mansa",
    destination: "Kalol Depot",
    status: "Cancelled",
    note: "Vehicle went to shop",
  },
];

function StatusBadge({ status }) {
  const s = TRIP_STATUS[status] || TRIP_STATUS.Draft;
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-medium inline-block"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status}
    </span>
  );
}

function LifecycleStepper({ current }) {
  return (
    <div className="flex items-start">
      {LIFECYCLE_STAGES.map((stage, i) => {
        const s = TRIP_STATUS[stage];
        const isCurrent = stage === current;
        return (
          <div key={stage} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center" style={{ width: 96 }}>
              <div
                className="rounded-full flex items-center justify-center transition-all"
                style={{
                  width: isCurrent ? 18 : 12,
                  height: isCurrent ? 18 : 12,
                  background: s.color,
                  boxShadow: isCurrent ? `0 0 0 4px ${s.color}2a` : "none",
                }}
              />
              <span
                className="text-xs mt-2 font-medium"
                style={{
                  color: isCurrent ? s.color : c.textMuted,
                  fontWeight: isCurrent ? 600 : 500,
                }}
              >
                {stage}
              </span>
            </div>
            {i < LIFECYCLE_STAGES.length - 1 && (
              <div
                className="flex-1 mt-1.5"
                style={{ height: 2, background: c.borderStrong }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TripDispatcher() {
  const [navSearch, setNavSearch] = useState("");
  const [trips, setTrips] = useState(initialTrips);
  const [availableVehicles, setAvailableVehicles] = useState(
    initialAvailableVehicles,
  );
  const [availableDrivers, setAvailableDrivers] = useState(
    initialAvailableDrivers,
  );

  const [source, setSource] = useState("Gandhinagar Depot");
  const [destination, setDestination] = useState("Ahmedabad Hub");
  const [vehicleId, setVehicleId] = useState(
    initialAvailableVehicles[0]?.id ?? "",
  );
  const [driverId, setDriverId] = useState(
    initialAvailableDrivers[0]?.id ?? "",
  );
  const [cargoWeight, setCargoWeight] = useState("700");
  const [plannedDistance, setPlannedDistance] = useState("38");

  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);
  const selectedDriver = availableDrivers.find((d) => d.id === driverId);

  const cargo = Number(cargoWeight) || 0;
  const overCapacity = selectedVehicle
    ? cargo > selectedVehicle.capacity
    : false;
  const overBy = selectedVehicle ? cargo - selectedVehicle.capacity : 0;

  const canDispatch = Boolean(
    source.trim() &&
    destination.trim() &&
    selectedVehicle &&
    selectedDriver &&
    cargo > 0 &&
    !overCapacity,
  );

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) =>
      [t.id, t.vehicle, t.driver, t.source, t.destination, t.status].some((f) =>
        (f || "").toLowerCase().includes(q),
      ),
    );
  }, [trips, navSearch]);

  const resetForm = () => {
    setSource("");
    setDestination("");
    setVehicleId(availableVehicles[0]?.id ?? "");
    setDriverId(availableDrivers[0]?.id ?? "");
    setCargoWeight("");
    setPlannedDistance("");
  };

  const nextTripId = () => {
    const n = trips.length + 1;
    return `TR${String(n).padStart(3, "0")}`;
  };

  const handleDispatch = () => {
    if (!canDispatch) return;
    setTrips((prev) => [
      {
        id: nextTripId(),
        vehicle: selectedVehicle.label.split(" - ")[0],
        driver: selectedDriver.label.toUpperCase(),
        source,
        destination,
        status: "Dispatched",
        note: "Just dispatched",
      },
      ...prev,
    ]);
    // Vehicle & driver are now on a trip — pull them out of the available pool.
    setAvailableVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    setAvailableDrivers((prev) => prev.filter((d) => d.id !== driverId));
    resetForm();
  };

  const completeTrip = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "Completed", note: "Delivered · odometer updated" }
          : t,
      ),
    );
    // In the real app this is also where vehicle/driver go back to Available.
  };

  const cancelTrip = (id) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "Cancelled", note: "Cancelled by dispatcher" }
          : t,
      ),
    );
  };

  const inputStyle = {
    background: c.panel,
    color: c.textPrimary,
    border: `1px solid ${c.border}`,
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: c.bg,
        fontFamily: "'Inter', ui-sans-serif, system-ui",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder, select { color-scheme: dark; }
      `}</style>

      <div className="p-3 sm:p-4">
        <Navbar
          userName="Raven K."
          userRole="Dispatcher"
          onSearch={setNavSearch}
        />
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${c.borderStrong}`, background: c.panel }}
        >
          <div className="px-6 py-6">
            <p
              className="text-[11px] uppercase tracking-widest mb-3"
              style={{ color: c.textMuted }}
            >
              Trip Lifecycle
            </p>
            <LifecycleStepper current="Dispatched" />
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-8"
            style={{ borderTop: `1px solid ${c.borderSoft}` }}
          >
            {/* ============ LEFT — CREATE TRIP ============ */}
            <div className="pt-6">
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: c.textPrimary }}
              >
                Create Trip
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Source
                  </label>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Depot or hub name"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Destination
                  </label>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Vehicle (Available Only)
                  </label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    {availableVehicles.length === 0 && (
                      <option value="">No vehicles available</option>
                    )}
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Driver (Available Only)
                  </label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    {availableDrivers.length === 0 && (
                      <option value="">No drivers available</option>
                    )}
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      ...inputStyle,
                      border: overCapacity
                        ? `1px solid ${c.rose}`
                        : inputStyle.border,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Planned Distance (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {/* Capacity validation */}
                {selectedVehicle &&
                  cargo > 0 &&
                  (overCapacity ? (
                    <div
                      className="rounded-lg px-4 py-3 text-sm space-y-1"
                      style={{
                        background: "rgba(251,113,133,0.08)",
                        border: `1px solid ${c.rose}`,
                      }}
                    >
                      <p style={{ color: c.textSecondary }}>
                        Vehicle Capacity: {selectedVehicle.capacity} kg
                      </p>
                      <p style={{ color: c.textSecondary }}>
                        Cargo Weight: {cargo} kg
                      </p>
                      <p
                        className="flex items-center gap-1.5 font-medium"
                        style={{ color: c.rose }}
                      >
                        <X size={14} strokeWidth={3} /> Capacity exceeded by{" "}
                        {overBy} kg — dispatch blocked
                      </p>
                    </div>
                  ) : (
                    <div
                      className="rounded-lg px-4 py-3 text-sm flex items-center gap-1.5"
                      style={{
                        background: "rgba(74,222,128,0.08)",
                        border: `1px solid ${c.green}55`,
                        color: c.green,
                      }}
                    >
                      <CircleCheck size={14} /> Within capacity —{" "}
                      {selectedVehicle.capacity - cargo} kg to spare
                    </div>
                  ))}

                <div className="flex gap-3 pt-1">
                  <button
                    disabled={!canDispatch}
                    onClick={handleDispatch}
                    className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
                    style={
                      canDispatch
                        ? {
                            background: c.amber,
                            color: "#1a1200",
                            cursor: "pointer",
                          }
                        : {
                            background: c.surface,
                            color: c.textMuted,
                            border: `1px solid ${c.border}`,
                            cursor: "not-allowed",
                          }
                    }
                  >
                    {canDispatch ? "Dispatch" : "Dispatch (disabled)"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                    style={{
                      background: "transparent",
                      color: c.rose,
                      border: `1px solid ${c.rose}55`,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* ============ RIGHT — LIVE BOARD ============ */}
            <div className="pt-6">
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: c.textPrimary }}
              >
                Live Board
              </h2>

              <div className="space-y-4">
                {filtered.length === 0 && (
                  <p className="text-sm" style={{ color: c.textMuted }}>
                    No trips match your search.
                  </p>
                )}
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg px-5 py-4"
                    style={{
                      border: `1px dashed ${c.borderStrong}`,
                      background: c.panel,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: c.textPrimary }}
                      >
                        {t.id}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: c.textMuted }}
                      >
                        {t.vehicle
                          ? `${t.vehicle} / ${t.driver}`
                          : "Unassigned"}
                      </span>
                    </div>

                    <p
                      className="text-sm mt-2"
                      style={{ color: c.textPrimary }}
                    >
                      {t.source}{" "}
                      <span style={{ color: c.textMuted }}>-&gt;</span>{" "}
                      {t.destination}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <StatusBadge status={t.status} />
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ color: c.textMuted }}
                        >
                          {t.note}
                        </span>
                        {(t.status === "Draft" ||
                          t.status === "Dispatched") && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => completeTrip(t.id)}
                              title="Mark complete"
                              className="p-1 rounded cursor-pointer"
                              style={{ color: c.green }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => cancelTrip(t.id)}
                              title="Cancel trip"
                              className="p-1 rounded cursor-pointer"
                              style={{ color: c.rose }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p
                className="text-xs mt-6 flex items-start gap-1.5"
                style={{ color: c.amber }}
              >
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                On Complete: odometer updates, and the assigned vehicle &amp;
                driver return to Available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
