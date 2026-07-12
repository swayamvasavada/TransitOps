import { useState, useMemo, useEffect } from "react";
import useTripStore from "../store/TripStore";
import useVehicleStore from "../store/VehicleStore";
import useDriverStore from "../store/DriverStore";
import { Check, X, AlertTriangle, CircleCheck, Loader2 } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Trip lifecycle — keyed on the backend's UPPERCASE status enum (matching the
// "AVAILABLE" convention already used by vehicles/drivers), with a friendly
// label for display. Same 4 stages, same colors, as the mock version.
// ---------------------------------------------------------------------------
const TRIP_STATUS = {
  DRAFT: { label: "Draft", color: c.textSecondary, bg: "rgba(136,145,171,0.16)", border: "rgba(136,145,171,0.4)" },
  DISPATCHED: { label: "Dispatched", color: c.blue, bg: "rgba(56,189,248,0.16)", border: "rgba(56,189,248,0.45)" },
  COMPLETED: { label: "Completed", color: c.green, bg: "rgba(74,222,128,0.16)", border: "rgba(74,222,128,0.45)" },
  CANCELLED: { label: "Cancelled", color: c.rose, bg: "rgba(251,113,133,0.18)", border: "rgba(251,113,133,0.45)" },
};
const LIFECYCLE_STAGES = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"];

function StatusBadge({ status }) {
  const s = TRIP_STATUS[status] || TRIP_STATUS.DRAFT;
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-medium inline-block"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
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
              <span className="text-xs mt-2 font-medium" style={{ color: isCurrent ? s.color : c.textMuted, fontWeight: isCurrent ? 600 : 500 }}>
                {s.label}
              </span>
            </div>
            {i < LIFECYCLE_STAGES.length - 1 && (
              <div className="flex-1 mt-1.5" style={{ height: 2, background: c.borderStrong }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TripDispatcher() {
  const [navSearch, setNavSearch] = useState("");

  // ---- stores -------------------------------------------------------------
  const {
    trips,
    loading: tripsLoading,
    error: tripError,
    getTrips,
    registerTrip,
    completeTrip,
    cancelTrip,
  } = useTripStore();

  const { vehicles, getVehicles } = useVehicleStore();
  const { drivers, getDrivers } = useDriverStore();

  // ---- form state -----------------------------------------------------------
  const [source, setSource] = useState("Gandhinagar Depot");
  const [destination, setDestination] = useState("Ahmedabad Hub");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("700");
  const [plannedDistance, setPlannedDistance] = useState("38");
  const [submitting, setSubmitting] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // ---- initial load ---------------------------------------------------------
  useEffect(() => {
    Promise.all([getTrips(), getVehicles(), getDrivers()]).catch(() => {
      // errors are already captured per-store in their `error` fields
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: adjust `v.status`/`d.status` and field names below if your
  // vehicle/driver store uses different keys than the VehicleRegistry /
  // DriverSafetyProfiles screens (e.g. vehicleID, name, capacity, status).
  const availableVehicles = useMemo(
    () => (vehicles || []).filter((v) => v.status === "AVAILABLE"),
    [vehicles]
  );
  const availableDrivers = useMemo(
    () => (drivers || []).filter((d) => d.status === "AVAILABLE"),
    [drivers]
  );

  // Normalize backend vehicle/driver objects so the UI can rely on stable keys
  const normalizedVehicles = useMemo(() => {
    return (vehicles || []).map((v) => ({
      vehicleID: v.vehicleID ?? v.id ?? v.vehicleId ?? v.registrationNumber ?? "",
      name: v.name ?? v.registrationNumber ?? v.label ?? v.model ?? "",
      capacity: (v.capacity ?? v.maxLoadCapacity ?? v.max_load_capacity ?? Number(v.maxLoadCapacity)) || 0,
      odometer: v.odometer ?? v.currentOdometer ?? v.odometerReading ?? 0,
      status: (v.status ?? v.state ?? (v.isAvailable ? "AVAILABLE" : undefined)) || "UNKNOWN",
      raw: v,
    }));
  }, [vehicles]);

  const normalizedDrivers = useMemo(() => {
    return (drivers || []).map((d, i) => ({
      driverID: d.driverID ?? d.id ?? d.driverId ?? d.userId ?? d._id ?? `driver-${i}`,
      name: (d.name ?? d.fullName ?? d.label ?? `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim()) || `Driver ${i + 1}`,
      // If the backend doesn't provide an availability status, assume available so it appears in the dropdown.
      status: (d.status ?? d.state ?? (d.isAvailable ? "AVAILABLE" : undefined)) || "AVAILABLE",
      raw: d,
    }));
  }, [drivers]);

  const availableVehiclesNorm = useMemo(
    () => normalizedVehicles.filter((v) => v.status === "AVAILABLE"),
    [normalizedVehicles]
  );

  const availableDriversNorm = useMemo(
    () => normalizedDrivers.filter((d) => !d.status || String(d.status).toUpperCase() === "AVAILABLE"),
    [normalizedDrivers]
  );

  useEffect(() => {
    if (!vehicleId && availableVehiclesNorm.length) {
      setVehicleId(String(availableVehiclesNorm[0].vehicleID));
    }
  }, [availableVehiclesNorm, vehicleId]);

  useEffect(() => {
    if (!driverId && availableDriversNorm.length) {
      setDriverId(String(availableDriversNorm[0].driverID));
    }
  }, [availableDriversNorm, driverId]);

  const selectedVehicle = availableVehiclesNorm.find((v) => String(v.vehicleID) === String(vehicleId));
  const selectedDriver = availableDriversNorm.find((d) => String(d.driverID) === String(driverId));

  const cargo = Number(cargoWeight) || 0;
  const overCapacity = selectedVehicle ? cargo > selectedVehicle.capacity : false;
  const overBy = selectedVehicle ? cargo - selectedVehicle.capacity : 0;

  const canDispatch = Boolean(
    source.trim() && destination.trim() && selectedVehicle && selectedDriver && cargo > 0 && !overCapacity && !submitting
  );

  // ---- lookups for the live board -------------------------------------------
  const vehicleLabel = (vehicleID) => normalizedVehicles.find((v) => String(v.vehicleID) === String(vehicleID))?.name ?? null;
  const driverLabel = (driverID) => normalizedDrivers.find((d) => String(d.driverID) === String(driverID))?.name ?? null;

  const tripNote = (t) => {
    switch (t.status) {
      case "DRAFT":
        return "Awaiting dispatch";
      case "DISPATCHED":
        return "In transit";
      case "COMPLETED":
        return t.finalOdometer != null ? `Delivered · odometer ${t.finalOdometer} km` : "Delivered";
      case "CANCELLED":
        return "Cancelled by dispatcher";
      default:
        return "";
    }
  };

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) =>
      [t.tripID, t.source, t.destination, t.status, vehicleLabel(t.vehicleID), driverLabel(t.driverID)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, navSearch, vehicles, drivers]);

  const resetForm = () => {
    setSource("");
    setDestination("");
    setVehicleId(availableVehiclesNorm[0] ? String(availableVehiclesNorm[0].vehicleID) : "");
    setDriverId(availableDriversNorm[0] ? String(availableDriversNorm[0].driverID) : "");
    setCargoWeight("");
    setPlannedDistance("");
  };

  // ---- actions ----------------------------------------------------------
  const handleDispatch = async () => {
    if (!canDispatch) return;
    setSubmitting(true);
    setDispatchError("");

    // Build payload and omit fields that are explicitly null so backend
    // doesn't receive `finalOdometer: null` / `fuelConsumed: null` which
    // some APIs reject.
    const payload = {
      source,
      destination,
      vehicleID: selectedVehicle.vehicleID,
      driverID: selectedDriver.driverID,
      cargoWeight: cargo,
      plannedDistance: Number(plannedDistance) || 0,
      startingOdometer: selectedVehicle.odometer ?? 0,
      status: "DISPATCHED",
    };

    const result = await registerTrip(payload);

    setSubmitting(false);

    if (!result.success) {
      setDispatchError(result.message || "Failed to dispatch trip");
      return;
    }

    // Vehicle & driver are now on a trip server-side — refresh availability.
    await Promise.all([getVehicles(), getDrivers()]);
    resetForm();
  };

  const handleCompleteTrip = async (trip) => {
    const finalOdometerInput = window.prompt("Final odometer (km)", trip.startingOdometer ?? "");
    if (finalOdometerInput === null) return;
    const fuelConsumedInput = window.prompt("Fuel consumed (L)", "0");
    if (fuelConsumedInput === null) return;

    const result = await completeTrip(trip.tripID, Number(finalOdometerInput) || 0, Number(fuelConsumedInput) || 0);
    if (result.success) {
      await Promise.all([getVehicles(), getDrivers()]);
    }
  };

  const handleCancelTrip = async (trip) => {
    const finalOdometerInput = window.prompt("Final odometer (km)", trip.startingOdometer ?? "0");
    if (finalOdometerInput === null) return;
    const fuelConsumedInput = window.prompt("Fuel consumed (L)", "0");
    if (fuelConsumedInput === null) return;

    const result = await cancelTrip(trip.tripID, Number(finalOdometerInput) || 0, Number(fuelConsumedInput) || 0);
    if (result.success) {
      await Promise.all([getVehicles(), getDrivers()]);
    }
  };

  const inputStyle = { background: c.panel, color: c.textPrimary, border: `1px solid ${c.border}` };

  return (
    <div className="min-h-screen" style={{ background: c.bg, fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder, select { color-scheme: dark; }
      `}</style>

      <div className="p-3 sm:p-4">
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.borderStrong}`, background: c.panel }}>
          <div className="px-6 pt-5 pb-1">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
              Trip Dispatcher
            </h1>
          </div>

          <Navbar userName="Raven K." userRole="Dispatcher" onSearch={setNavSearch} />

          <div className="px-6 py-6">
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: c.textMuted }}>Trip Lifecycle</p>
            <LifecycleStepper current="DISPATCHED" />
          </div>

          {tripError && (
            <div className="mx-6 mb-4 px-4 py-2.5 rounded-lg text-xs" style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${c.rose}55`, color: c.rose }}>
              {tripError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-8" style={{ borderTop: `1px solid ${c.borderSoft}` }}>
            {/* ============ LEFT — CREATE TRIP ============ */}
            <div className="pt-6">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: c.textPrimary }}>
                Create Trip
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Source</label>
                  <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Depot or hub name" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Destination</label>
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Vehicle (Available Only)</label>
                  <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                    {availableVehiclesNorm.length === 0 && <option value="">No vehicles available</option>}
                    {availableVehiclesNorm.map((v) => (
                      <option key={v.vehicleID} value={v.vehicleID}>
                        {v.name} - {v.capacity} kg capacity
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Driver (Available Only)</label>
                  <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                    {availableDriversNorm.length === 0 && <option value="">No drivers available</option>}
                    {availableDriversNorm.map((d) => (
                      <option key={d.driverID} value={d.driverID}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Cargo Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={{ ...inputStyle, border: overCapacity ? `1px solid ${c.rose}` : inputStyle.border }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Planned Distance (km)</label>
                  <input type="number" min="0" value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>

                {/* Capacity validation */}
                {selectedVehicle && cargo > 0 && (
                  overCapacity ? (
                    <div className="rounded-lg px-4 py-3 text-sm space-y-1" style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${c.rose}` }}>
                      <p style={{ color: c.textSecondary }}>Vehicle Capacity: {selectedVehicle.capacity} kg</p>
                      <p style={{ color: c.textSecondary }}>Cargo Weight: {cargo} kg</p>
                      <p className="flex items-center gap-1.5 font-medium" style={{ color: c.rose }}>
                        <X size={14} strokeWidth={3} /> Capacity exceeded by {overBy} kg — dispatch blocked
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg px-4 py-3 text-sm flex items-center gap-1.5" style={{ background: "rgba(74,222,128,0.08)", border: `1px solid ${c.green}55`, color: c.green }}>
                      <CircleCheck size={14} /> Within capacity — {selectedVehicle.capacity - cargo} kg to spare
                    </div>
                  )
                )}

                {dispatchError && (
                  <div className="rounded-lg px-4 py-3 text-sm flex items-center gap-1.5" style={{ background: "rgba(251,113,133,0.08)", border: `1px solid ${c.rose}55`, color: c.rose }}>
                    <AlertTriangle size={14} /> {dispatchError}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    disabled={!canDispatch}
                    onClick={handleDispatch}
                    className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={
                      canDispatch
                        ? { background: c.amber, color: "#1a1200", cursor: "pointer" }
                        : { background: c.surface, color: c.textMuted, border: `1px solid ${c.border}`, cursor: "not-allowed" }
                    }
                  >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? "Dispatching…" : canDispatch ? "Dispatch" : "Dispatch (disabled)"}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                    style={{ background: "transparent", color: c.rose, border: `1px solid ${c.rose}55` }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* ============ RIGHT — LIVE BOARD ============ */}
            <div className="pt-6">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: c.textPrimary }}>
                Live Board
              </h2>

              <div className="space-y-4">
                {tripsLoading && trips.length === 0 && (
                  <p className="text-sm flex items-center gap-2" style={{ color: c.textMuted }}>
                    <Loader2 size={14} className="animate-spin" /> Loading trips…
                  </p>
                )}
                {!tripsLoading && filtered.length === 0 && (
                  <p className="text-sm" style={{ color: c.textMuted }}>No trips match your search.</p>
                )}
                {filtered.map((t) => {
                  const vLabel = vehicleLabel(t.vehicleID);
                  const dLabel = driverLabel(t.driverID);
                  return (
                    <div key={t.tripID} className="rounded-lg px-5 py-4" style={{ border: `1px dashed ${c.borderStrong}`, background: c.panel }}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-sm" style={{ color: c.textPrimary }}>{t.tripID}</span>
                        <span className="text-xs font-mono" style={{ color: c.textMuted }}>
                          {vLabel ? `${vLabel} / ${dLabel ?? "—"}` : "Unassigned"}
                        </span>
                      </div>

                      <p className="text-sm mt-2" style={{ color: c.textPrimary }}>
                        {t.source} <span style={{ color: c.textMuted }}>-&gt;</span> {t.destination}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <StatusBadge status={t.status} />
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: c.textMuted }}>{tripNote(t)}</span>
                          {(t.status === "DRAFT" || t.status === "DISPATCHED") && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCompleteTrip(t)}
                                title="Mark complete"
                                className="p-1 rounded cursor-pointer"
                                style={{ color: c.green }}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleCancelTrip(t)}
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
                  );
                })}
              </div>

              <p className="text-xs mt-6 flex items-start gap-1.5" style={{ color: c.amber }}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                On Complete: odometer updates, and the assigned vehicle &amp; driver return to Available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}