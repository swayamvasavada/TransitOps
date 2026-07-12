import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Truck,
  Radio,
  ShieldCheck,
  LineChart,
  ChevronDown,
  Check,
  Mail,
  Lock,
  AlertTriangle,
  CircleCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/AuthStore";

// ---------------------------------------------------------------------------
// Design tokens — a dispatch-console palette: near-black chassis, signal-amber
// primary accent, per-role "line colors" borrowed from transit-map wayfinding.
// ---------------------------------------------------------------------------
const c = {
  bg: "#0a0e17",
  bgVignette: "radial-gradient(ellipse at 20% 0%, rgba(255,176,32,0.07) 0%, transparent 45%), radial-gradient(ellipse at 85% 90%, rgba(45,212,191,0.06) 0%, transparent 45%)",
  surface: "#111726",
  surfaceRaised: "#141c30",
  panel: "#0d1220",
  border: "#212c45",
  borderSoft: "#1a2238",
  borderStrong: "#2e3c5e",
  textPrimary: "#eef1f8",
  textSecondary: "#8891ab",
  textMuted: "#525c79",
  amber: "#ffb020",
  amberSoft: "rgba(255,176,32,0.12)",
  teal: "#2dd4bf",
  rose: "#fb7185",
  violet: "#a78bfa",
  error: "#fb6474",
  errorBg: "rgba(251,100,116,0.08)",
  errorBorder: "rgba(251,100,116,0.35)",
  success: "#34d399",
};

const ROLES = [
  {
    name: "Fleet Manager",
    value: "ROLE_MANAGER",
    code: "FM-01",
    color: c.amber,
    icon: Truck,
    desc: "Vehicles & route oversight",
  },
  {
    name: "Dispatcher",
    value: "ROLE_DISPATCHER",
    code: "DP-02",
    color: c.teal,
    icon: Radio,
    desc: "Live dispatch & routing",
  },
  {
    name: "Safety Officer",
    value: "ROLE_SAFETY_OFFICER",
    code: "SO-03",
    color: c.rose,
    icon: ShieldCheck,
    desc: "Incidents & compliance",
  },
  {
    name: "Financial Analyst",
    value: "ROLE_FINANCIAL_ANALYST",
    code: "FA-04",
    color: c.violet,
    icon: LineChart,
    desc: "Costs & billing",
  },
  {
    name: "Driver",
    value: "ROLE_DRIVER",
    code: "DR-05",
    color: "#22c55e",
    icon: Truck,
    desc: "Driver operations",
  },
];

// ---------------------------------------------------------------------------
// Custom RBAC role selector — replaces the native <select> with a console
// style "channel" picker so each role reads by color + code, not just text.
// ---------------------------------------------------------------------------
function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(() => ROLES.findIndex((r) => r.name === value));
  const rootRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = ROLES.find((r) => r.name === value) ?? ROLES[0];

  const handleKeyDown = (e) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(ROLES.length - 1, h + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(ROLES[highlight].name);
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-150 cursor-pointer"
        style={{
          background: c.panel,
          border: open ? `1px solid ${selected.color}` : `1px solid ${c.border}`,
          boxShadow: open ? `0 0 0 3px ${selected.color}22` : `inset 0 1px 2px rgba(0,0,0,0.4)`,
        }}
      >
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: `${selected.color}1f`, border: `1px solid ${selected.color}55` }}
        >
          <selected.icon size={15} style={{ color: selected.color }} strokeWidth={2} />
        </span>
        <span className="flex-1 text-left">
          <span className="block font-medium" style={{ color: c.textPrimary }}>
            {selected.name}
          </span>
          <span
            className="block text-[10px] font-mono tracking-widest mt-0.5"
            style={{ color: c.textMuted }}
          >
            {selected.code}
          </span>
        </span>
        <ChevronDown
          size={16}
          style={{
            color: c.textSecondary,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 left-0 right-0 bottom-full mb-2 rounded-xl overflow-hidden p-1.5"
          style={{
            background: c.surfaceRaised,
            border: `1px solid ${c.borderStrong}`,
            boxShadow: "0 20px 45px rgba(0,0,0,0.55)",
            animation: "roleDropIn 140ms ease",
          }}
        >
          {ROLES.map((r, i) => {
            const isSelected = r.name === value;
            const isHighlighted = i === highlight;
            return (
              <button
                type="button"
                key={r.name}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  onChange(r.name);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left cursor-pointer transition-colors duration-100"
                style={{
                  background: isHighlighted ? `${r.color}14` : "transparent",
                }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                  style={{ background: `${r.color}1f`, border: `1px solid ${r.color}55` }}
                >
                  <r.icon size={13} style={{ color: r.color }} strokeWidth={2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>
                      {r.name}
                    </span>
                    <span
                      className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded"
                      style={{ color: r.color, background: `${r.color}1a` }}
                    >
                      {r.code}
                    </span>
                  </span>
                  <span className="block text-xs mt-0.5 truncate" style={{ color: c.textMuted }}>
                    {r.desc}
                  </span>
                </span>
                {isSelected && <Check size={15} style={{ color: r.color }} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Fleet Manager");
  const [remember, setRemember] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { login, requestResetPassword, loading, resetUserPassword } = useAuthStore();
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { token } = useParams();
  const isResetPassword = !!token;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isResetPassword) {

      if (!newPassword) {
        setError("Please enter new password");
        return;
      }

      const response = await resetUserPassword(
        token,
        newPassword
      );

      if (response.success) {
        alert("Password changed successfully");

        navigate("/");
      } else {
        setError(response.message);
      }

      return;
    }
    if (forgotPassword) {
      if (!email) {
        setError("Please enter your email");
        return;
      }

      const response = await requestResetPassword(email);

      if (response.success) {
        setForgotPassword(false); // Back to login page
        alert("Password reset link sent successfully.");
      } else {
        setError(response.message);
      }

      return;
    }

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    const selectedRole = ROLES.find((r) => r.name === role);
    try {
      const response = await login(email, password, selectedRole?.value);

      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const activeRole = ROLES.find((r) => r.name === role) ?? ROLES[0];
  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden"
      style={{ background: c.bg, fontFamily: "'Inter', ui-sans-serif, system-ui" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes roleDropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes travel { 0% { top: 6%; } 100% { top: 92%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-3px); } 40%, 60% { transform: translateX(3px); } }
        .err-anim { animation: shake 420ms ease; }
        input::placeholder { color: #4a5372; }
        select { color-scheme: dark; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none" style={{ background: c.bgVignette }} />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* ================= LEFT — OPERATIONS CONSOLE ================= */}
      <div
        className="hidden md:flex md:w-[42%] p-14 flex-col justify-between relative z-10 border-r"
        style={{ background: c.panel, borderColor: c.borderSoft }}
      >
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{ background: c.amberSoft, border: `1.5px solid ${c.amber}66` }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-[3px] w-5 h-5">
                <div className="rounded-[2px]" style={{ background: c.amber }} />
                <div className="rounded-[2px]" style={{ background: c.teal }} />
                <div className="rounded-[2px]" style={{ background: c.teal }} />
                <div className="rounded-[2px]" style={{ background: c.amber }} />
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold tracking-tight leading-none"
                style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                TransitOps
              </div>
              <div
                className="text-[10px] font-mono tracking-[0.2em] mt-1"
                style={{ color: c.textMuted }}
              >
                CONSOLE ACCESS
              </div>
            </div>
          </div>

          <h1
            className="text-[28px] leading-tight font-semibold tracking-tight max-w-xs"
            style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            One console for the whole fleet, gated by role.
          </h1>
          <p className="text-sm mt-3 max-w-[280px] leading-relaxed" style={{ color: c.textSecondary }}>
            Sign in to reach live routing, safety alerts and billing — scoped to what your role can see.
          </p>

          {/* Signature: live "route line" with role stops */}
          <div className="relative mt-14 pl-8" style={{ height: 230 }}>
            <div
              className="absolute top-0 bottom-0"
              style={{ left: 15, width: 2, background: c.borderStrong }}
            />
            <div
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                left: 10,
                background: c.amber,
                boxShadow: `0 0 10px ${c.amber}`,
                animation: "travel 3.6s ease-in-out infinite alternate",
              }}
            />
            {ROLES.map((r, i) => (
              <div key={r.name} className="relative flex items-center gap-3 mb-[46px] last:mb-0">
                <div
                  className="absolute rounded-full"
                  style={{ left: -18, width: 9, height: 9, background: r.color, boxShadow: `0 0 0 3px ${c.panel}` }}
                />
                <span
                  className="text-[11px] font-mono tracking-widest px-2 py-1 rounded"
                  style={{ color: r.color, background: `${r.color}17` }}
                >
                  {r.code}
                </span>
                <span className="text-xs" style={{ color: c.textSecondary }}>
                  {r.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase" style={{ color: c.textMuted }}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: c.success, animation: "blink 2s ease-in-out infinite" }}
          />
          System operational · RBAC enabled
        </div>
      </div>

      {/* ================= RIGHT — FORM ================= */}
      <div className="w-full md:w-[58%] p-6 md:p-16 flex items-center justify-center relative z-10">
        <div
          className="w-full max-w-md p-8 md:p-9 rounded-2xl"
          style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* mobile brand mark */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.amberSoft, border: `1px solid ${c.amber}66` }}>
              <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-3.5 h-3.5">
                <div className="rounded-[1px]" style={{ background: c.amber }} />
                <div className="rounded-[1px]" style={{ background: c.teal }} />
                <div className="rounded-[1px]" style={{ background: c.teal }} />
                <div className="rounded-[1px]" style={{ background: c.amber }} />
              </div>
            </div>
            <span className="text-sm font-bold" style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
              TransitOps
            </span>
          </div>

          <div className="mb-7">
            <h2
              className="text-2xl font-semibold tracking-tight"
              style={{ color: c.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isResetPassword
                ? "Create New Password"
                : forgotPassword
                  ? "Forgot Password"
                  : "Sign In"}
            </h2>
            <p className="text-sm mt-1.5" style={{ color: c.textSecondary }}>
              {isResetPassword
                ? "Enter your new password"
                : forgotPassword
                  ? "Enter your email"
                  : "Enter your credentials to reach the console"}
            </p>
          </div>

          {success ? (
            <div
              className="flex flex-col items-center text-center gap-3 py-10"
              style={{ animation: "roleDropIn 220ms ease" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: `1px solid ${c.success}55` }}>
                <CircleCheck size={24} style={{ color: c.success }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: c.textPrimary }}>
                  Access granted
                </p>
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                  Routing to the {activeRole.name} dashboard…
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* EMAIL */}
              {!isResetPassword && (
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted, letterSpacing: "0.12em" }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: emailFocused ? c.amber : c.textMuted }}
                    />
                    <input
                      type="email"
                      placeholder="raven.k@transitops.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
                      style={{
                        background: c.panel,
                        color: c.textPrimary,
                        border: emailFocused ? `1px solid ${c.amber}` : `1px solid ${c.border}`,
                        boxShadow: emailFocused ? `0 0 0 3px ${c.amber}22` : "inset 0 1px 2px rgba(0,0,0,0.4)",
                      }}
                    />
                  </div>
                </div>
              )}
              {isResetPassword && (
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted, letterSpacing: "0.12em" }}
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: passwordFocused ? c.amber : c.textMuted }}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: c.panel,
                        color: c.textPrimary,
                        border: `1px solid ${c.border}`,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              {!forgotPassword && !isResetPassword && (
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted, letterSpacing: "0.12em" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: passwordFocused ? c.amber : c.textMuted }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all duration-150"
                      style={{
                        background: c.panel,
                        color: c.textPrimary,
                        border: passwordFocused ? `1px solid ${c.amber}` : `1px solid ${c.border}`,
                        boxShadow: passwordFocused ? `0 0 0 3px ${c.amber}22` : "inset 0 1px 2px rgba(0,0,0,0.4)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: c.textMuted }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {/* ROLE (custom dropdown) */}
              {!forgotPassword && !isResetPassword &&(
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted, letterSpacing: "0.12em" }}
                  >
                    Role · RBAC
                  </label>

                  <RoleSelect value={role} onChange={setRole} />
                </div>
              )}

              {/* REMEMBER + FORGOT */}
              {!forgotPassword && !isResetPassword && (
                <div className="flex items-center justify-between pt-1">
                  <label
                    className="flex items-center gap-2 text-xs cursor-pointer select-none"
                    onClick={() => setRemember((r) => !r)}
                    style={{ color: c.textSecondary }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center transition-all duration-150"
                      style={{
                        background: remember ? c.amberSoft : c.panel,
                        border: remember ? `1px solid ${c.amber}` : `1px solid ${c.border}`,
                      }}
                    >
                      {remember && <Check size={11} style={{ color: c.amber }} strokeWidth={3} />}
                    </div>
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(true);
                      setError("");
                    }}
                    className="text-xs bg-transparent border-none cursor-pointer font-medium"
                    style={{ color: c.amber }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                style={{
                  background: loading ? c.amberSoft : c.amber,
                  color: loading ? c.amber : "#1a1200",
                  boxShadow: loading ? "none" : `0 8px 24px ${c.amber}33`,
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                      isResetPassword
                        ? "Reset Password"
                        : forgotPassword
                          ? "Submit"
                          : "Sign In"
                )}
              </button>

              {/* ERROR */}
              {error && (
                <div
                  className="err-anim p-3.5 rounded-xl text-xs flex items-start gap-2.5"
                  style={{ background: c.errorBg, border: `1px dashed ${c.errorBorder}`, color: c.error }}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Sign-in failed</p>
                    <p className="mt-0.5" style={{ color: "#f8b4bc" }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}