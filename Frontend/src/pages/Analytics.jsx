import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  blue: "#5b8fd6",
};

const KPIS = [
  { label: "Fuel Efficiency", value: "8.4 km/l", accent: c.blue },
  { label: "Fleet Utilization", value: "81%", accent: c.green },
  { label: "Operational Cost", value: "34,070", accent: c.amber },
  { label: "Vehicle ROI", value: "14.2%", accent: c.green },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 14.2 },
  { month: "Feb", revenue: 16.8 },
  { month: "Mar", revenue: 13.5 },
  { month: "Apr", revenue: 18.1 },
  { month: "May", revenue: 15.9 },
  { month: "Jun", revenue: 19.4 },
  { month: "Jul", revenue: 17.6 },
];

const costliestVehicles = [
  { name: "TRUCK-11", cost: 250000, color: c.rose },
  { name: "MINI-03", cost: 140000, color: c.amber },
  { name: "VAN-05", cost: 62000, color: c.blue },
];
const maxCost = Math.max(...costliestVehicles.map((v) => v.cost));

function KpiCard({ label, value, accent }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: c.panel,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <p
        className="text-[11px] uppercase tracking-widest font-semibold"
        style={{ color: c.textMuted }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-3xl font-bold"
        style={{
          color: c.textPrimary,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: c.surfaceRaised,
        border: `1px solid ${c.borderStrong}`,
        color: c.textPrimary,
      }}
    >
      <p className="font-semibold mb-0.5">{label}</p>
      <p style={{ color: c.blue }}>Rs. {payload[0].value}L</p>
    </div>
  );
}

export default function Analytics() {
  const [navSearch, setNavSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return costliestVehicles;
    return costliestVehicles.filter((v) => v.name.toLowerCase().includes(q));
  }, [navSearch]);

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
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              {KPIS.map((k) => (
                <KpiCard key={k.label} {...k} />
              ))}
            </div>
            <p className="text-xs mb-8" style={{ color: c.textMuted }}>
              ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Monthly revenue */}
              <div>
                <h2
                  className="text-sm font-bold uppercase tracking-widest mb-5"
                  style={{ color: c.textPrimary }}
                >
                  Monthly Revenue
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyRevenue}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={c.borderSoft}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: c.textMuted, fontSize: 12 }}
                        axisLine={{ stroke: c.borderSoft }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: c.textMuted, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={34}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill={c.blue}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive
                        animationDuration={900}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top costliest vehicles */}
              <div>
                <h2
                  className="text-sm font-bold uppercase tracking-widest mb-5"
                  style={{ color: c.textPrimary }}
                >
                  Top Costliest Vehicles
                </h2>
                <div className="space-y-5">
                  {filteredVehicles.length === 0 && (
                    <p className="text-sm" style={{ color: c.textMuted }}>
                      No vehicles match your search.
                    </p>
                  )}
                  {filteredVehicles.map((v) => (
                    <div key={v.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: c.textPrimary }}
                        >
                          {v.name}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{ color: c.textSecondary }}
                        >
                          ₹{v.cost.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div
                        className="w-full h-3 rounded-full overflow-hidden"
                        style={{ background: c.surface }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(v.cost / maxCost) * 100}%`,
                            background: v.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
