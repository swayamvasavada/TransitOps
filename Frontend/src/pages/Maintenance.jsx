import { useState, useMemo } from "react";
import { ArrowRight, Info } from "lucide-react";
import Navbar from "../components/Navbar";

// ---------------------------------------------------------------------------
// Same dark-console tokens as the rest of the app.
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
};

const STATUS_STYLES = {
  Active: {
    label: "In Shop",
    bg: "rgba(255,176,32,0.16)",
    text: c.amber,
    border: "rgba(255,176,32,0.45)",
  },
  Completed: {
    label: "Completed",
    bg: "rgba(74,222,128,0.16)",
    text: c.green,
    border: "rgba(74,222,128,0.45)",
  },
};

// Mock fleet — in the real app this should come from VehicleRegistry state.
const VEHICLES = ["VAN-05", "TRUCK-11", "MINI-03", "VAN-09"];

const initialLogs = [
  {
    id: 1,
    vehicle: "VAN-05",
    service: "Oil Change",
    cost: 2500,
    status: "Active",
  },
  {
    id: 2,
    vehicle: "TRUCK-11",
    service: "Engine Repair",
    cost: 18000,
    status: "Completed",
  },
  {
    id: 3,
    vehicle: "MINI-03",
    service: "Tyre Replace",
    cost: 6200,
    status: "Active",
  },
];

const inr = (n) => Number(n).toLocaleString("en-IN");

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Active;
  return (
    <span
      className="text-xs px-3 py-1 rounded-full font-medium inline-block"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

// Small pill used inside the flow diagram
function FlowPill({ label, color }) {
  return (
    <span className="text-sm font-semibold" style={{ color }}>
      {label}
    </span>
  );
}

function FlowRow({ from, fromColor, to, toColor, caption }) {
  return (
    <div className="flex items-center gap-4">
      <FlowPill label={from} color={fromColor} />
      <div className="flex-1 flex items-center gap-2 min-w-[160px]">
        <div className="flex-1 h-px" style={{ background: c.borderStrong }} />
        <ArrowRight size={16} style={{ color: c.textMuted }} />
      </div>
      <FlowPill label={to} color={toColor} />
      <span className="text-xs hidden sm:inline" style={{ color: c.textMuted }}>
        {caption}
      </span>
    </div>
  );
}

export default function MaintenanceLog() {
  const [navSearch, setNavSearch] = useState("");
  const [logs, setLogs] = useState(initialLogs);

  const [vehicle, setVehicle] = useState("VAN-05");
  const [serviceType, setServiceType] = useState("Oil Change");
  const [cost, setCost] = useState("2500");
  const [date, setDate] = useState("2026-07-07");
  const [status, setStatus] = useState("Active");

  const filtered = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [l.vehicle, l.service, l.status].some((f) => f.toLowerCase().includes(q)),
    );
  }, [logs, navSearch]);

  const canSave = vehicle && serviceType.trim() && Number(cost) >= 0 && date;

  const handleSave = () => {
    if (!canSave) return;
    setLogs((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((l) => l.id)) + 1 : 1,
        vehicle,
        service: serviceType,
        cost: Number(cost) || 0,
        status,
      },
      ...prev,
    ]);
    setServiceType("");
    setCost("");
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
        input::placeholder { color: #4a5372; }
        select, input[type="date"] { color-scheme: dark; }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-6 py-8">
            {/* ============ LEFT — LOG SERVICE RECORD ============ */}
            <div>
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: c.textPrimary }}
              >
                Log Service Record
              </h2>

              <div className="space-y-4 max-w-sm p-4 rounded-lg" style={{ border: `1px solid ${c.borderSoft}`, background: c.surfaceRaised }}>
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Vehicle
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    {VEHICLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Service Type
                  </label>
                  <input
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Oil Change"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-1.5"
                    style={{ color: c.textMuted }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
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
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button
                  disabled={!canSave}
                  onClick={handleSave}
                  className="w-full py-3 rounded-lg text-sm font-semibold transition-all mt-2"
                  style={
                    canSave
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
                  Save
                </button>
              </div>

              {/* Vehicle-status flow diagram */}
              <div className="mt-9 space-y-4 max-w-md">
                <FlowRow
                  from="Available"
                  fromColor={c.green}
                  to="In Shop"
                  toColor={c.amber}
                  caption="creating active record"
                />
                <FlowRow
                  from="In Shop"
                  fromColor={c.amber}
                  to="Available"
                  toColor={c.green}
                  caption="closing record (marks complete)"
                />
              </div>

              <p
                className="text-xs mt-5 flex items-start gap-1.5"
                style={{ color: c.amber }}
              >
                <Info size={13} className="shrink-0 mt-0.5" />
                Note: In Shop vehicles are removed from the dispatch pool.
              </p>
            </div>

            {/* ============ RIGHT — SERVICE LOG ============ */}
            <div>
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-5"
                style={{ color: c.textPrimary }}
              >
                Service Log
              </h2>

              <div
                className="overflow-x-auto rounded-lg"
                style={{ border: `1px solid ${c.borderSoft}` }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="text-[11px] uppercase tracking-widest"
                      style={{
                        color: c.textMuted,
                        borderBottom: `1px solid ${c.borderSoft}`,
                      }}
                    >
                      {["Vehicle", "Service", "Cost", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left font-semibold whitespace-nowrap"
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
                          colSpan={4}
                          className="text-center py-12 text-sm"
                          style={{ color: c.textMuted }}
                        >
                          No service records found.
                        </td>
                      </tr>
                    ) : null}
                    {filtered.map((l) => (
                      <tr
                        key={l.id}
                        style={{ borderBottom: `1px solid ${c.borderSoft}` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = c.surface)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td
                          className="px-5 py-3.5 font-semibold"
                          style={{ color: c.textPrimary }}
                        >
                          {l.vehicle}
                        </td>
                        <td
                          className="px-5 py-3.5"
                          style={{ color: c.textSecondary }}
                        >
                          {l.service}
                        </td>
                        <td
                          className="px-5 py-3.5 font-mono text-xs"
                          style={{ color: c.textSecondary }}
                        >
                          {inr(l.cost)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={l.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
