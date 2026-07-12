import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Plus, X, Trash2, Edit } from "lucide-react";
import Navbar from "../components/Navbar";
import useVehicleStore from "../store/vehicleStore";

// ---------------------------------------------------------------------------
// Palette — same dark-console tokens as Navbar/LoginPage. Kept local so this
// page renders correctly even where ../colors/colors is incomplete (the
// previous version referenced `c` and `authColors` without either being
// defined, which is why nothing rendered).
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
  amberDark: "#b5790f",
  teal: "#2dd4bf",
  rose: "#fb7185",
};

const STATUS_STYLES = {
  Available: {
    bg: "rgba(74,222,128,0.14)",
    text: "#4ade80",
    border: "rgba(74,222,128,0.4)",
  },
  "On Trip": {
    bg: "rgba(56,189,248,0.14)",
    text: "#38bdf8",
    border: "rgba(56,189,248,0.4)",
  },
  "In Shop": {
    bg: "rgba(255,176,32,0.14)",
    text: c.amber,
    border: "rgba(255,176,32,0.4)",
  },
  Retired: {
    bg: "rgba(251,113,133,0.14)",
    text: c.rose,
    border: "rgba(251,113,133,0.4)",
  },
};

const STATUS_OPTIONS = ["All", "Available", "On Trip", "In Shop", "Retired"];
const VEHICLE_TYPES = ["Van", "Truck", "Mini"];

// const initialVehicles = [
//   {
//     id: 1,
//     reg: "GJ01AB452",
//     name: "VAN-05",
//     type: "Van",
//     capacity: "500 kg",
//     odometer: 74000,
//     cost: 620000,
//     status: "Available",
//   },
//   {
//     id: 2,
//     reg: "GJ01AB998",
//     name: "TRUCK-11",
//     type: "Truck",
//     capacity: "5 Ton",
//     odometer: 182000,
//     cost: 2450000,
//     status: "On Trip",
//   },
//   {
//     id: 3,
//     reg: "GJ01AB1120",
//     name: "MINI-03",
//     type: "Mini",
//     capacity: "1 Ton",
//     odometer: 66000,
//     cost: 410000,
//     status: "In Shop",
//   },
//   {
//     id: 4,
//     reg: "GJ01AB008",
//     name: "VAN-09",
//     type: "Van",
//     capacity: "750 kg",
//     odometer: 241900,
//     cost: 590000,
//     status: "Retired",
//   },
// ];

const inr = (n) => Number(n).toLocaleString("en-IN");

// ---------------------------------------------------------------------------
// Small reusable dropdown for the toolbar filters
// ---------------------------------------------------------------------------
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-all duration-150"
        style={{
          background: c.panel,
          border: open ? `1px solid ${c.amber}` : `1px solid ${c.border}`,
          color: c.textPrimary,
          boxShadow: open ? `0 0 0 3px ${c.amber}22` : "none",
        }}
      >
        <span style={{ color: c.textMuted }}>{label}:</span>
        <span className="font-medium">{value}</span>
        <ChevronDown
          size={14}
          style={{
            color: c.textMuted,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 mt-2 min-w-full rounded-lg overflow-hidden p-1"
          style={{
            background: c.surfaceRaised,
            border: `1px solid ${c.borderStrong}`,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-4 px-3 py-2 rounded-md text-sm text-left cursor-pointer whitespace-nowrap"
              style={{
                color: opt === value ? c.amber : c.textSecondary,
                background: opt === value ? `${c.amber}14` : "transparent",
              }}
            >
              {opt}
              {opt === value && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Vehicle modal
// ---------------------------------------------------------------------------
function AddVehicleModal({ onSave, onCancel, loading, error, initialData }) {
  const [form, setForm] = useState({
    reg: "",
    name: "",
    type: "Van",
    capacity: "",
    odometer: "",
    cost: "",
    status: "Available",
  });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // If editing, populate form from initialData
  useEffect(() => {
    if (initialData) {
      setForm({
        reg: initialData.registrationNumber || initialData.reg || "",
        name: initialData.name || "",
        type: initialData.type || "Van",
        capacity: initialData.maxLoadCapacity ? String(initialData.maxLoadCapacity) : initialData.capacity || "",
        odometer: initialData.odometer ? String(initialData.odometer) : "",
        cost: initialData.acquisitionCost ? String(initialData.acquisitionCost) : initialData.cost || "",
        status: initialData.status ? (typeof initialData.status === 'string' ? initialData.status.replace(/_/g, ' ') : initialData.status) : "Available",
      });
    }
  }, [initialData]);

  const inputStyle = {
    background: c.panel,
    color: c.textPrimary,
    border: `1px solid ${c.border}`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.reg || !form.name) return;
    onSave({
      ...form,
      odometer: Number(form.odometer) || 0,
      cost: Number(form.cost) || 0,
    });
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          animation: "regFadeIn 180ms ease-out",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${c.borderSoft}` }}
        >
          <div>
            <h2
              className="font-bold text-base"
              style={{ color: c.textPrimary }}
            >
              New Vehicle Registration
            </h2>
            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
              Fill in vehicle details below
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xl leading-none cursor-pointer"
            style={{ color: c.textMuted }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Reg. No.
              </label>
              <input
                required
                value={form.reg}
                onChange={update("reg")}
                placeholder="GJ01AB000"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Name / Model
              </label>
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="VAN-06"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Type
              </label>
              <select
                value={form.type}
                onChange={update("type")}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle, colorScheme: "dark" }}
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Capacity
              </label>
              <input
                value={form.capacity}
                onChange={update("capacity")}
                placeholder="500 kg"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Odometer (km)
              </label>
              <input
                type="number"
                value={form.odometer}
                onChange={update("odometer")}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Acq. Cost (₹)
              </label>
              <input
                type="number"
                value={form.cost}
                onChange={update("cost")}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase mb-1.5"
              style={{ color: c.textMuted }}
            >
              Status
            </label>
            <select
              value={form.status}
              onChange={update("status")}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ ...inputStyle, colorScheme: "dark" }}
            >
              {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                color: "#fb7185",
                background: "rgba(251,113,133,.08)",
                border: "1px solid rgba(251,113,133,.25)",
              }}
            >
              {error}
            </div>
          )}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{
                background: c.panel,
                color: c.textSecondary,
                border: `1px solid ${c.border}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: c.amber, color: "#1a1200" }}
            >
              {loading ? "Registering..." : initialData ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function VehicleRegistry() {
  //   const [vehicles, setVehicles] = useState(initialVehicles);
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regSearch, setRegSearch] = useState("");
  const [navSearch, setNavSearch] = useState("");
  const { registerVehicle, loading, error, vehicles, getVehicles, deleteVehicle } =
    useVehicleStore();
  const [editingVehicle, setEditingVehicle] = useState(null);

  const typeOptions = useMemo(
    () => ["All", ...new Set(vehicles.map((v) => v.type))],
    [vehicles],
  );
  useEffect(() => {
    getVehicles();
  }, [getVehicles]);

  const handleSaveVehicle = async (newVehicle) => {
    const vehicleID = editingVehicle ? editingVehicle.vehicleID : 0;
    const result = await registerVehicle({
      vehicleID,
      registrationNumber: newVehicle.reg,
      name: newVehicle.name,
      type: newVehicle.type,
      maxLoadCapacity: Number(newVehicle.capacity),
      odometer: Number(newVehicle.odometer),
      acquisitionCost: Number(newVehicle.cost),
      status: newVehicle.status.toUpperCase().replace(/\s+/g, "_"),
    });

    if (result.success) {
      await getVehicles(); // Refresh the table
      setShowModal(false);
      setEditingVehicle(null);
    }
  };

  const handleDelete = async (vehicleID) => {
    const result = await deleteVehicle(vehicleID);

    if (result.success) {
      console.log("Vehicle deleted successfully");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const filtered = vehicles.filter((v) => {
    const matchesType = typeFilter === "All" || v.type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    const regVal = (v.reg || v.registrationNumber || "").toString();
    const matchesReg = regVal.toLowerCase().includes(regSearch.toLowerCase());
    const q = navSearch.trim().toLowerCase();
    const navFields = [regVal, v.name || v.vehicleName || "", v.type || "", v.status || ""];
    const matchesNav = !q || navFields.some((f) => f.toString().toLowerCase().includes(q));
    return matchesType && matchesStatus && matchesReg && matchesNav;
  });

  return (
    <div
      className="min-h-screen"
      style={{
        background: c.bg,
        fontFamily: "'Inter', ui-sans-serif, system-ui",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes regFadeIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        input::placeholder { color: #4a5372; }
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
          {/* Toolbar */}
          <div
            className="px-6 py-4 flex flex-wrap items-center gap-3"
            style={{ borderBottom: `1px solid ${c.borderSoft}` }}
          >
            <FilterDropdown
              label="Type"
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
            />

            <input
              value={regSearch}
              onChange={(e) => setRegSearch(e.target.value)}
              placeholder="Search reg. no..."
              className="px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                background: c.panel,
                color: c.textPrimary,
                border: `1px solid ${c.border}`,
                minWidth: 190,
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

            <button
              onClick={() => setShowModal(true)}
              className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-transform"
              style={{ background: c.amber, color: "#1a1200" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Vehicle
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] uppercase tracking-widest"
                  style={{
                    color: c.textMuted,
                    borderBottom: `1px solid ${c.borderSoft}`,
                  }}
                >
                  {[
                    "Reg. No. (Unique)",
                    "Name / Model",
                    "Type",
                    "Capacity",
                    "Odometer",
                    "Acq. Cost",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-3.5 text-left font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-sm"
                      style={{ color: c.textMuted }}
                    >
                      No vehicles found.
                    </td>
                  </tr>
                ) : null}
                {filtered.map((v) => {
                  const status =
                    STATUS_STYLES[v.status] || STATUS_STYLES.Available;
                  return (
                    <tr
                      key={v.id}
                      className="group transition-colors"
                      style={{ borderBottom: `1px solid ${c.borderSoft}` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = c.surface)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td
                        className="px-8 py-4 font-mono text-xs font-semibold"
                        style={{ color: c.textPrimary }}
                      >
                        {v.reg || v.registrationNumber || v.registrationNo}
                      </td>
                      <td
                        className="px-8 py-4"
                        style={{ color: c.textPrimary }}
                      >
                        {v.name}
                      </td>
                      <td
                        className="px-8 py-4"
                        style={{ color: c.textSecondary }}
                      >
                        {v.type}
                      </td>
                      <td
                        className="px-8 py-4"
                        style={{ color: c.textSecondary }}
                      >
                        {v.capacity}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {inr(v.odometer)}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {inr(v.cost)}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: status.bg,
                              color: status.text,
                              border: `1px solid ${status.border}`,
                            }}
                          >
                            {v.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(v)}
                              aria-label={`Edit ${v.registrationNumber}`}
                              className="p-1 rounded hover:bg-[rgba(255,255,255,0.02)]"
                              style={{ color: c.textMuted }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(v.vehicleID)}
                              aria-label={`Delete ${v.registrationNumber}`}
                              className="p-1 rounded hover:bg-[rgba(255,255,255,0.02)]"
                              style={{ color: c.textMuted }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 text-xs flex justify-between"
            style={{
              backgroundColor: c.surface,
              borderTop: `1px solid ${c.borderSoft}`,
              color: c.textSecondary,
            }}
          >
            <span>
              Showing {filtered.length} of {vehicles.length} vehicles
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <AddVehicleModal
          initialData={editingVehicle}
          onSave={handleSaveVehicle}
          onCancel={() => {
            setShowModal(false);
            setEditingVehicle(null);
          }}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
