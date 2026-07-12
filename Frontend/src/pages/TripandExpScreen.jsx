import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
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
  rose: "#fb7185",
  green: "#4ade80",
};

const VEHICLES = ["VAN-05", "TRUCK-11", "MINI-03", "TRK-12", "VAN-09"];
const TRIPS = ["TR001", "TR004", "TR005", "TR006"];

const initialFuelLogs = [
  { id: 1, vehicle: "VAN-05", date: "2026-07-05", liters: 42, cost: 3150 },
  { id: 2, vehicle: "TRUCK-11", date: "2026-07-06", liters: 110, cost: 8400 },
  { id: 3, vehicle: "MINI-03", date: "2026-07-06", liters: 28, cost: 2050 },
];

const initialExpenses = [
  { id: 1, trip: "TR001", vehicle: "VAN-05", toll: 120, other: 0, maint: 0 },
  { id: 2, trip: "TR005", vehicle: "TRK-12", toll: 340, other: 150, maint: 18000 },
];

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function totalOf(e) {
  return e.toll + e.other + e.maint;
}

function TotalPill({ amount }) {
  const color = amount === 0 ? c.textMuted : amount < 1000 ? c.green : amount < 10000 ? c.amber : c.rose;
  const bg = amount === 0 ? c.surface : amount < 1000 ? "rgba(74,222,128,0.14)" : amount < 10000 ? "rgba(255,176,32,0.14)" : "rgba(251,113,133,0.16)";
  const border = amount === 0 ? c.border : `${color}55`;
  return (
    <span className="text-xs px-3 py-1 rounded-full font-medium inline-block font-mono" style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}>
      {inr(amount)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
function ModalShell({ title, subtitle, onCancel, children }) {
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.55)", animation: "feFadeIn 180ms ease-out" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${c.borderSoft}` }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: c.textPrimary }}>{title}</h2>
            <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>{subtitle}</p>
          </div>
          <button onClick={onCancel} className="cursor-pointer" style={{ color: c.textMuted }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function LogFuelModal({ onSave, onCancel }) {
  const [vehicle, setVehicle] = useState(VEHICLES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const inputStyle = { background: c.panel, color: c.textPrimary, border: `1px solid ${c.border}` };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!liters || !cost) return;
    onSave({ vehicle, date, liters: Number(liters), cost: Number(cost) });
  };

  return (
    <ModalShell title="Log Fuel" subtitle="Record a refuelling entry" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Vehicle</label>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle, colorScheme: "dark" }}>
            {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle, colorScheme: "dark" }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Liters</label>
            <input type="number" min="0" required value={liters} onChange={(e) => setLiters(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Fuel Cost (₹)</label>
            <input type="number" min="0" required value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ background: c.panel, color: c.textSecondary, border: `1px solid ${c.border}` }}>Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: c.amber, color: "#1a1200" }}>Save</button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddExpenseModal({ onSave, onCancel }) {
  const [trip, setTrip] = useState(TRIPS[0]);
  const [vehicle, setVehicle] = useState(VEHICLES[0]);
  const [toll, setToll] = useState("");
  const [other, setOther] = useState("");
  const [maint, setMaint] = useState("");
  const inputStyle = { background: c.panel, color: c.textPrimary, border: `1px solid ${c.border}` };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ trip, vehicle, toll: Number(toll) || 0, other: Number(other) || 0, maint: Number(maint) || 0 });
  };

  return (
    <ModalShell title="Add Expense" subtitle="Toll, misc, or linked maintenance cost" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Trip</label>
            <select value={trip} onChange={(e) => setTrip(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle, colorScheme: "dark" }}>
              {TRIPS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Vehicle</label>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle, colorScheme: "dark" }}>
              {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Toll (₹)</label>
            <input type="number" min="0" value={toll} onChange={(e) => setToll(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Other (₹)</label>
            <input type="number" min="0" value={other} onChange={(e) => setOther(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>Maint. (₹)</label>
            <input type="number" min="0" value={maint} onChange={(e) => setMaint(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer" style={{ background: c.panel, color: c.textSecondary, border: `1px solid ${c.border}` }}>Cancel</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: c.amber, color: "#1a1200" }}>Save</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function FuelExpenseManagement() {
  const [navSearch, setNavSearch] = useState("");
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const q = navSearch.trim().toLowerCase();
  const filteredFuel = useMemo(
    () => (q ? fuelLogs.filter((f) => f.vehicle.toLowerCase().includes(q)) : fuelLogs),
    [fuelLogs, q]
  );
  const filteredExpenses = useMemo(
    () => (q ? expenses.filter((e) => [e.trip, e.vehicle].some((f) => f.toLowerCase().includes(q))) : expenses),
    [expenses, q]
  );

  const fuelTotal = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const maintTotal = expenses.reduce((sum, e) => sum + e.maint, 0);
  const operationalTotal = fuelTotal + maintTotal;

  const saveFuel = (entry) => {
    setFuelLogs((prev) => [{ id: prev.length ? Math.max(...prev.map((f) => f.id)) + 1 : 1, ...entry }, ...prev]);
    setShowFuelModal(false);
  };
  const saveExpense = (entry) => {
    setExpenses((prev) => [{ id: prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1, ...entry }, ...prev]);
    setShowExpenseModal(false);
  };

  return (
    <div className="min-h-screen" style={{ background: c.bg, fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        input::placeholder { color: #4a5372; }
        @keyframes feFadeIn { from { opacity: 0; transform: scale(0.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div className="p-3 sm:p-4">
          <Navbar userName="Raven K." userRole="Dispatcher" onSearch={setNavSearch} />
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.borderStrong}`, background: c.panel }}>


          {/* FUEL LOGS */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: c.textPrimary }}>Fuel Logs</h2>
              <div className="flex gap-2.5">
                <button onClick={() => setShowFuelModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: c.amber, color: "#1a1200" }}>
                  <Plus size={14} strokeWidth={2.5} /> Log Fuel
                </button>
                <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ background: c.amber, color: "#1a1200" }}>
                  <Plus size={14} strokeWidth={2.5} /> Add Expense
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${c.borderSoft}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest" style={{ color: c.textMuted, borderBottom: `1px solid ${c.borderSoft}` }}>
                    {["Vehicle", "Date", "Liters", "Fuel Cost"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFuel.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-sm" style={{ color: c.textMuted }}>No fuel logs found.</td></tr>
                  ) : null}
                  {filteredFuel.map((f) => (
                    <tr
                      key={f.id}
                      style={{ borderBottom: `1px solid ${c.borderSoft}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.surface)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-6 py-3.5 font-semibold" style={{ color: c.textPrimary }}>{f.vehicle}</td>
                      <td className="px-6 py-3.5" style={{ color: c.textSecondary }}>{formatDate(f.date)}</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: c.textSecondary }}>{f.liters} L</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: c.textPrimary }}>{inr(f.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OTHER EXPENSES */}
          <div className="px-6 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: c.textPrimary }}>Other Expenses (Toll / Misc)</h2>

            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${c.borderSoft}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-widest" style={{ color: c.textMuted, borderBottom: `1px solid ${c.borderSoft}` }}>
                    {["Trip", "Vehicle", "Toll", "Other", "Maint. (Linked)", "Total"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: c.textMuted }}>No expenses found.</td></tr>
                  ) : null}
                  {filteredExpenses.map((e) => (
                    <tr
                      key={e.id}
                      style={{ borderBottom: `1px solid ${c.borderSoft}` }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = c.surface)}
                      onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-6 py-3.5 font-semibold" style={{ color: c.textPrimary }}>{e.trip}</td>
                      <td className="px-6 py-3.5" style={{ color: c.textSecondary }}>{e.vehicle}</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: c.textSecondary }}>{inr(e.toll)}</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: c.textSecondary }}>{inr(e.other)}</td>
                      <td className="px-6 py-3.5 font-mono text-xs" style={{ color: c.textSecondary }}>{inr(e.maint)}</td>
                      <td className="px-6 py-3.5"><TotalPill amount={totalOf(e)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAL OPERATIONAL COST */}
          <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: `1px solid ${c.borderStrong}` }}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: c.textPrimary }}>
              Total Operational Cost (Auto) = Fuel + Maint
            </span>
            <span className="text-xl font-bold font-mono" style={{ color: c.amber }}>{inr(operationalTotal)}</span>
          </div>
        </div>
      </div>

      {showFuelModal && <LogFuelModal onSave={saveFuel} onCancel={() => setShowFuelModal(false)} />}
      {showExpenseModal && <AddExpenseModal onSave={saveExpense} onCancel={() => setShowExpenseModal(false)} />}
    </div>
  );
}