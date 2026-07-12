import { useState } from "react";
import { authColors } from "../colors/colors";
import { useNavigate } from "react-router-dom";

const EyeIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    )}
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export default function LoginPage() {
  const c = authColors;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Dispatcher");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [roleFocused, setRoleFocused] = useState(false);

  const roles = [
    "Fleet Manager",
    "Dispatcher",
    "Safety Officer",
    "Financial Analyst",
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Invalid credentials. Account locked after 5 failed attempts.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0E131F] text-white">
      {/* ================= LEFT BRAND SECTION ================= */}
      <div className="w-full md:w-5/12 bg-[#CED5DD] text-[#111827] p-8 md:p-12 flex flex-col justify-between relative">
        <div>
          {/* Grid Logo Icon */}
          <div className="w-12 h-12 mb-4 border-2 border-[#8B5A2B] grid grid-cols-4 grid-rows-4 gap-0.5 p-1 bg-[#D97706]/10">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-[#8B5A2B]/40 w-full h-full" />
            ))}
          </div>

          {/* Title & Tagline */}
          <h1 className="text-3xl font-bold tracking-tight text-black">TransitOps</h1>
          <p className="text-sm font-medium text-gray-700 mt-1">
            Smart Transport Operations Platform
          </p>

          {/* Role bullets list */}
          <div className="mt-20">
            <p className="text-base font-semibold text-gray-800 mb-3">
              One login, four roles:
            </p>
            <ul className="space-y-2 text-sm text-gray-800 font-medium pl-1">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                Fleet Manager
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                Dispatcher
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                Safety Officer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B45309]" />
                Financial Analyst
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-xs font-mono text-gray-600 tracking-wider uppercase">
          TRANSITOPS © 2026 • RBAC ENABLED
        </div>
      </div>

      {/* ================= RIGHT FORM SECTION ================= */}
      <div className="w-full md:w-7/12 bg-[#0E131F] p-8 md:p-16 flex items-center justify-center relative">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Enter your credentials to continue
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium uppercase text-gray-400 tracking-wider mb-1.5">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="Raven.k@transitops.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#161F30] border text-white text-sm focus:outline-none transition-colors"
                style={{
                  borderColor: emailFocused ? c.teal400 : "rgba(255,255,255,0.12)",
                }}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium uppercase text-gray-400 tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#161F30] border text-white text-sm pr-10 focus:outline-none transition-colors"
                  style={{
                    borderColor: passwordFocused ? c.teal400 : "rgba(255,255,255,0.12)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* ROLE SELECT (RBAC) */}
            <div>
              <label className="block text-xs font-medium uppercase text-gray-400 tracking-wider mb-1.5">
                ROLE (RBAC)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={() => setRoleFocused(true)}
                onBlur={() => setRoleFocused(false)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#161F30] border text-white text-sm focus:outline-none cursor-pointer appearance-none transition-colors"
                style={{
                  borderColor: roleFocused ? c.teal400 : "rgba(255,255,255,0.12)",
                }}
              >
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-[#161F30] text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between pt-1">
              <label
                className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none"
                onClick={() => setRemember(!remember)}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    remember ? "bg-emerald-500 border-emerald-500" : "border-gray-500 bg-[#161F30]"
                  }`}
                >
                  {remember && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-sky-400 hover:underline bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm bg-[#B45309] hover:bg-[#D97706] transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* ERROR CARD */}
            {error && (
              <div className="p-3 border border-dashed border-red-500/60 bg-red-950/20 rounded-lg text-red-400 text-xs space-y-1 mt-4">
                <p className="font-semibold flex items-center gap-1">
                  <span>❌</span> Error state
                </p>
                <p>{error}</p>
              </div>
            )}
          </form>

          {/* SCOPED ACCESS FOOTER LEGEND */}
          <div className="pt-6 border-t border-white/10 text-xs text-gray-400 space-y-1 font-mono">
            <p className="text-gray-300 font-semibold mb-1">
              Access is scoped by role after login:
            </p>
            <p>• Fleet Manager → Fleet, Maintenance</p>
            <p>• Dispatcher → Dashboard, Trips</p>
            <p>• Safety Officer → Drivers, Compliance</p>
            <p>• Financial Analyst → Fuel & Expenses, Analytics</p>
          </div>

        </div>
      </div>
    </div>
  );
}