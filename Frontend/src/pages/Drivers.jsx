import { useState, useMemo, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import useAuthStore from "../store/AuthStore";
import useDriverStore from "../store/DriverStore";

// ---------------------------------------------------------------------------
// Same dark-console tokens as Navbar / VehicleRegistry / LoginPage, kept
// local so this screen matches without depending on an external colors file.
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

const STATUS_STYLES = {
  Available: {
    bg: "rgba(74,222,128,0.16)",
    text: c.green,
    border: "rgba(74,222,128,0.45)",
  },
  "On Trip": {
    bg: "rgba(56,189,248,0.16)",
    text: c.blue,
    border: "rgba(56,189,248,0.45)",
  },
  "Off Duty": {
    bg: "rgba(136,145,171,0.16)",
    text: c.textSecondary,
    border: "rgba(136,145,171,0.4)",
  },
  Suspended: {
    bg: "rgba(251,146,60,0.18)",
    text: "#fb923c",
    border: "rgba(251,146,60,0.45)",
  },
};

const STATUS_OPTIONS = ["Available", "On Trip", "Off Duty", "Suspended"];

// Treat an "MM/YYYY" expiry as expired once we're past the end of that month
function isExpired(expiry) {
  if (!expiry || typeof expiry !== "string") return false;
  const parts = expiry.split("/").map(Number);
  if (!parts || parts.length < 2) return false;
  const [mm, yyyy] = parts;
  if (!mm || !yyyy) return false;
  const endOfMonth = new Date(yyyy, mm, 0, 23, 59, 59);
  return endOfMonth < new Date();
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Available;
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-medium inline-block"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Add Driver modal
// ---------------------------------------------------------------------------
function AddDriverModal({ onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    license: "",
    expiry: "",
    contact: "",
    trips: "",
    safety: 100, // Explicitly default safety to 100 on initial creation
    status: "Available",
  });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputStyle = {
    background: c.panel,
    color: c.textPrimary,
    border: `1px solid ${c.border}`,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.license) return;
    onSave({ ...form, trips: Number(form.trips) || 0, safety: Number(form.safety) || 100 });
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
          animation: "spFadeIn 180ms ease-out",
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
              New Driver
            </h2>
            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
              Fill in driver details below
            </p>
          </div>
          <button
            onClick={onCancel}
            className="cursor-pointer"
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
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="Driver name"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                License No.
              </label>
              <input
                required
                value={form.license}
                onChange={update("license")}
                placeholder="DL-00000"
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
                Expiry (MM/YYYY)
              </label>
              <input
                required
                value={form.expiry}
                onChange={update("expiry")}
                placeholder="12/2028"
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
                Contact
              </label>
              <input
                value={form.contact}
                onChange={update("contact")}
                placeholder="98765xxxxx"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-1.5"
                style={{ color: c.textMuted }}
              >
                Trip Compl. (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.trips}
                onChange={update("trips")}
                placeholder="0"
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
                Safety (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.safety}
                onChange={update("safety")}
                placeholder="100"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle}
              />
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
              style={{ background: c.amber, color: "#1a1200" }}
            >
              Save Driver
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
export default function DriverSafetyProfiles() {
  const { signup } = useAuthStore();
  const drivers = useDriverStore((state) => state.drivers);
  const [showModal, setShowModal] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const fetchDrivers = useDriverStore((state) => state.fetchDrivers);

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      [d.name, d.license, d.contact, d.status].some((f) =>
        f?.toLowerCase().includes(q),
      ),
    );
  }, [drivers, navSearch]);

  const selectedDriver = drivers.find((d) => (d.id ?? d.driverID ?? d.driverId) === selectedId);

  const handleSaveDriver = async (newDriver) => {
      const [month, year] = newDriver.expiry.split("/");

  const licenseExpiryDate = new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toISOString();
  const result = await signup({
    name: newDriver.name,

    // Replace with actual email/password fields if you add them to the form
    email: `${newDriver.name.toLowerCase().replace(/\s+/g, "")}@fleet.com`,
    password: "DriverPassword123!",

    phoneNo: newDriver.contact,
    licenseNo: newDriver.license,

    // If your backend expects ISO date, convert accordingly
    licenseExpiryDate: licenseExpiryDate,

    role: "ROLE_DRIVER",

    // Extra fields only for Add Driver
    driverStatus: "AVAILABLE",
    safetyScore: 100,
    driverID: null,
  });

  if (result.success) {
    // Refresh drivers from the store so UI reflects backend state
    await fetchDrivers();
    setShowModal(false);
  } else {
    alert(result.message);
  }
};

useEffect(() => {
  // fetch once on mount
  fetchDrivers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const applyStatus = (status) => {
    if (!selectedId) return;
    setDrivers((prev) =>
      prev.map((d) => (d.id === selectedId ? { ...d, status } : d)),
    );
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
        @keyframes spFadeIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
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
            className="px-6 py-4 flex justify-end"
            style={{ borderBottom: `1px solid ${c.borderSoft}` }}
          >
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-transform"
              style={{ background: c.amber, color: "#1a1200" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-1px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Driver
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
                    "Driver",
                    "License No",
                    "Expiry",
                    "Contact",
                    "Trip Compl.",
                    "Safety",
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
                      No drivers found.
                    </td>
                  </tr>
                ) : null}
                {filtered.map((d) => {
                  const expired = isExpired(d.expiry);
                  const isSelected = d.id === selectedId;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: `1px solid ${c.borderSoft}`,
                        borderLeft: isSelected
                          ? `3px solid ${c.amber}`
                          : "3px solid transparent",
                        backgroundColor: isSelected ? c.surface : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor = c.surface;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td
                        className="px-8 py-4 font-semibold"
                        style={{ color: c.textPrimary }}
                      >
                        {d.name}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {d.licenseNo}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{ color: expired ? c.rose : c.textSecondary }}
                        >
                          {d.licenseExpiryDate}
                          {expired && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(251,113,133,0.15)",
                                color: c.rose,
                              }}
                            >
                              <AlertTriangle size={10} /> Expired
                            </span>
                          )}
                        </span>
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {d.phoneNo}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {d.trips ?? '-'}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs font-semibold"
                        style={{ color: c.teal }}
                      >
                        {d.safetyScore}
                      </td>
                      <td className="px-8 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Toggle status */}
          <div className="px-8 pt-6 pb-2">
            <p
              className="text-[11px] uppercase tracking-widest mb-3"
              style={{ color: c.textMuted }}
            >
              Toggle Status{selectedDriver ? ` — ${selectedDriver.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {STATUS_OPTIONS.map((status) => {
                const style = STATUS_STYLES[status];
                const isCurrent = selectedDriver?.status === status;
                return (
                  <button
                    key={status}
                    disabled={!selectedDriver}
                    onClick={() => applyStatus(status)}
                    className="text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                      border: isCurrent
                        ? `1.5px solid ${style.text}`
                        : `1px solid ${style.border}`,
                      boxShadow: isCurrent
                        ? `0 0 0 3px ${style.text}22`
                        : "none",
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
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
              Showing {filtered.length} of {drivers.length} drivers
            </span>
          </div>
        </div>
      </div>

      {showModal && (
        <AddDriverModal
          onSave={handleSaveDriver}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}