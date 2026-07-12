import { useState } from "react";
import Navbar from "../components/Navbar";

const c = {
	bg: "#0a0e17",
	panel: "#0d1220",
	surface: "#111726",
	surfaceRaised: "#141c30",
	border: "#212c45",
	borderSoft: "#1a2238",
	textPrimary: "#eef1f8",
	textSecondary: "#8891ab",
	textMuted: "#525c79",
	blue: "#6aa8ff",
};

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

export default function Settings() {
	const [navSearch, setNavSearch] = useState("");
	const [depot, setDepot] = useState("Gandhinagar Depot GJ-4");
	const [currency, setCurrency] = useState("INR (Rs)");
	const [distanceUnit, setDistanceUnit] = useState("Kilometers");

	const handleSave = (e) => {
		e.preventDefault();
		// persist settings (stub)
		console.log("save settings", { depot, currency, distanceUnit });
	};

	return (
		<div className="min-h-screen" style={{ background: c.bg, fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
			<style>{`input::placeholder { color: #4a5372; }`}</style>

			<div className="p-3 sm:p-4">
				<Navbar userName="Raven K." userRole="Dispatcher" onSearch={setNavSearch} />

				<div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.borderStrong || c.border}`, background: c.panel }}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-8">
						<div>
							<h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: c.textPrimary }}>
								General
							</h2>

							<form onSubmit={handleSave} className="max-w-lg space-y-4">
								<div>
									<label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>
										Depot name
									</label>
									<input value={depot} onChange={(e) => setDepot(e.target.value)} placeholder="Gandhinagar Depot GJ-4" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: c.surfaceRaised, color: c.textPrimary, border: `1px solid ${c.border}` }} />
								</div>

								<div>
									<label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>
										Currency
									</label>
									<input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="INR (Rs)" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: c.surfaceRaised, color: c.textPrimary, border: `1px solid ${c.border}` }} />
								</div>

								<div>
									<label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: c.textMuted }}>
										Distance unit
									</label>
									<input value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)} placeholder="Kilometers" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={{ background: c.surfaceRaised, color: c.textPrimary, border: `1px solid ${c.border}` }} />
								</div>

								<div className="pt-4">
									<button type="submit" className="px-4 py-2 rounded-md font-semibold" style={{ background: c.blue, color: "#06121b" }}>
										Save changes
									</button>
								</div>
							</form>
						</div>

						<div>
							<h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: c.textPrimary }}>
								Role-based access (RBAC)
							</h2>

							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="text-[11px] uppercase tracking-widest" style={{ color: c.textMuted, borderBottom: `1px solid ${c.borderSoft}` }}>
											{ ["Role", "Fleet", "Driver", "Trip", "Fuel/Exp.", "Analytics" ].map((h) => (
												<th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{ROLES.map((r) => (
											<tr key={r} style={{ borderBottom: `1px solid ${c.borderSoft}` }}>
												<td className="px-4 py-3" style={{ color: c.textPrimary }}>{r}</td>
												<td className="px-4 py-3" style={{ color: c.textSecondary }}>✓</td>
												<td className="px-4 py-3" style={{ color: c.textSecondary }}>View</td>
												<td className="px-4 py-3" style={{ color: c.textSecondary }}>—</td>
												<td className="px-4 py-3" style={{ color: c.textSecondary }}>—</td>
												<td className="px-4 py-3" style={{ color: c.textSecondary }}>✓</td>
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
