import { useState, useMemo } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";

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
const CATEGORIES = ["LMV", "HMV"];

const initialDrivers = [
  {
    id: 1,
    name: "Alex",
    license: "DL-88213",
    category: "LMV",
    expiry: "12/2028",
    contact: "98765xxxxx",
    trips: 96,
    safety: "Available",
    status: "Available",
  },
  {
    id: 2,
    name: "John",
    license: "DL-44120",
    category: "HMV",
    expiry: "03/2025",
    contact: "98220xxxx",
    trips: 81,
    safety: "Suspended",
    status: "Suspended",
  },
  {
    id: 3,
    name: "Priya",
    license: "DL-77031",
    category: "LMV",
    expiry: "08/2027",
    contact: "99110xxxxx",
    trips: 99,
    safety: "On Trip",
    status: "On Trip",
  },
  {
    id: 4,
    name: "Suresh",
    license: "DL-90045",
    category: "HMV",
    expiry: "01/2027",
    contact: "97440xxxx",
    trips: 88,
    safety: "Available",
    status: "Off Duty",
  },
];

// Treat an "MM/YYYY" expiry as expired once we're past the end of that month
function isExpired(expiry) {
  const [mm, yyyy] = expiry.split("/").map(Number);
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
    category: "LMV",
    expiry: "",
    contact: "",
    trips: "",
    safety: "Available",
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
    onSave({ ...form, trips: Number(form.trips) || 0 });
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
                Category
              </label>
              <select
                value={form.category}
                onChange={update("category")}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle, colorScheme: "dark" }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
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
                Safety
              </label>
              <select
                value={form.safety}
                onChange={update("safety")}
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
  const [drivers, setDrivers] = useState(initialDrivers);
  const [showModal, setShowModal] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [selectedId, setSelectedId] = useState(initialDrivers[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      [d.name, d.license, d.category, d.contact, d.status].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [drivers, navSearch]);

  const selectedDriver = drivers.find((d) => d.id === selectedId);

  const handleSaveDriver = (newDriver) => {
    setDrivers((prev) => {
      const id = prev.length ? Math.max(...prev.map((d) => d.id)) + 1 : 1;
      return [...prev, { id, ...newDriver }];
    });
    setShowModal(false);
  };

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
                    "Category",
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
                      colSpan={8}
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
                        {d.license}
                      </td>
                      <td
                        className="px-8 py-4"
                        style={{ color: c.textSecondary }}
                      >
                        {d.category}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{ color: expired ? c.rose : c.textSecondary }}
                        >
                          {d.expiry}
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
                        {d.contact}
                      </td>
                      <td
                        className="px-8 py-4 font-mono text-xs"
                        style={{ color: c.textSecondary }}
                      >
                        {d.trips}%
                      </td>
                      <td className="px-8 py-4">
                        <StatusBadge status={d.safety} />
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
