import { useState, useRef, useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import {
  ChevronDown,
  Check,
  CircleCheck,
  AlertTriangle,
  Truck,
  Radio,
  ShieldCheck,
  LineChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Local palette matching LoginPage
const c = {
  bg: "#0a0e17",
  bgVignette:
    "radial-gradient(ellipse at 20% 0%, rgba(255,176,32,0.07) 0%, transparent 45%), radial-gradient(ellipse at 85% 90%, rgba(45,212,191,0.06) 0%, transparent 45%)",
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
    code: "FM-01",
    color: c.amber,
    icon: Truck,
    desc: "Vehicles & route oversight",
  },
  {
    name: "Dispatcher",
    code: "DP-02",
    color: c.teal,
    icon: Radio,
    desc: "Live dispatch & routing",
  },
  {
    name: "Safety Officer",
    code: "SO-03",
    color: c.rose,
    icon: ShieldCheck,
    desc: "Incidents & compliance",
  },
  {
    name: "Financial Analyst",
    code: "FA-04",
    color: c.violet,
    icon: LineChart,
    desc: "Costs & billing",
  },
  {
    name: "Driver",
    code: "DR-05",
    color: c.teal,
    icon: Truck,
    desc: "Field operator / driver",
  },
];
const roleMap = {
  "Fleet Manager": "ROLE_MANAGER",
  Dispatcher: "ROLE_DISPATCHER",
  "Safety Officer": "ROLE_SAFETY_OFFICER",
  "Financial Analyst": "ROLE_FINANCE",
  Driver: "ROLE_DRIVER",
};

function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(() =>
    ROLES.findIndex((r) => r.name === value),
  );
  const rootRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = ROLES.find((r) => r.name === value) ?? ROLES[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-150 cursor-pointer"
        style={{
          background: c.panel,
          border: open
            ? `1px solid ${selected.color}`
            : `1px solid ${c.border}`,
        }}
      >
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
          }}
        >
          {ROLES.map((r, i) => (
            <button
              key={r.name}
              onClick={() => {
                onChange(r.name);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlight(i)}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left cursor-pointer"
              style={{
                background: i === highlight ? `${r.color}14` : "transparent",
              }}
            >
              <span className="flex-1 min-w-0">
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: c.textPrimary }}
                >
                  {r.name}
                </span>
                <span
                  className="block text-xs mt-0.5 truncate"
                  style={{ color: c.textMuted }}
                >
                  {r.desc}
                </span>
              </span>
              {value === r.name && (
                <Check size={15} style={{ color: r.color }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Dispatcher");
  const [licenseNo, setLicenseNo] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { signup, loading, error } = useAuthStore();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!/^\d{10}$/.test(phone))
      e.phone = "Enter a valid 10-digit phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (role === "Driver") {
      if (!licenseNo.trim())
        e.licenseNo = "License number is required for drivers";
      if (!licenseExpiry) e.licenseExpiry = "License expiry is required";
      else if (new Date(licenseExpiry) <= new Date())
        e.licenseExpiry = "License expiry must be in the future";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await signup({
      name,
      email,
      password,
      phoneNo: phone,
      licenseNo: role === "Driver" ? licenseNo : "",
      licenseExpiryDate:
        role === "Driver" ? new Date(licenseExpiry).toISOString() : null,
      role: roleMap[role],
    });

    if (result.success) {
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden"
        style={{
          background: c.bg,
          fontFamily: "'Inter', ui-sans-serif, system-ui",
        }}
      >
        <style>{`input::placeholder { color: #4a5372; }`}</style>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: c.bgVignette }}
        />

        <div
          className="hidden md:flex md:w-[42%] p-14 flex-col justify-between relative z-10 border-r"
          style={{ background: c.panel, borderColor: c.borderSoft }}
        >
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center relative"
                style={{
                  background: c.amberSoft,
                  border: `1.5px solid ${c.amber}66`,
                }}
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-[3px] w-5 h-5">
                  <div
                    className="rounded-[2px]"
                    style={{ background: c.amber }}
                  />
                  <div
                    className="rounded-[2px]"
                    style={{ background: c.teal }}
                  />
                  <div
                    className="rounded-[2px]"
                    style={{ background: c.teal }}
                  />
                  <div
                    className="rounded-[2px]"
                    style={{ background: c.amber }}
                  />
                </div>
              </div>
              <div>
                <div
                  className="text-lg font-bold tracking-tight leading-none"
                  style={{
                    color: c.textPrimary,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
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
              style={{
                color: c.textPrimary,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              One console for the whole fleet, gated by role.
            </h1>
            <p
              className="text-sm mt-3 max-w-[280px] leading-relaxed"
              style={{ color: c.textSecondary }}
            >
              Sign up to reach live routing, safety alerts and billing — scoped
              to what your role can see.
            </p>

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
                <div
                  key={r.name}
                  className="relative flex items-center gap-3 mb-[46px] last:mb-0"
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      left: -18,
                      width: 9,
                      height: 9,
                      background: r.color,
                      boxShadow: `0 0 0 3px ${c.panel}`,
                    }}
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

          <div
            className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase"
            style={{ color: c.textMuted }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: c.success,
                animation: "blink 2s ease-in-out infinite",
              }}
            />
            System operational · RBAC enabled
          </div>
        </div>

        <div className="w-full md:w-[58%] p-6 md:p-16 flex items-center justify-center relative z-10">
          <div
            className="w-full max-w-md p-8 md:p-9 rounded-2xl"
            style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: c.amberSoft,
                  border: `1px solid ${c.amber}66`,
                }}
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-3.5 h-3.5">
                  <div
                    className="rounded-[1px]"
                    style={{ background: c.amber }}
                  />
                  <div
                    className="rounded-[1px]"
                    style={{ background: c.teal }}
                  />
                  <div
                    className="rounded-[1px]"
                    style={{ background: c.teal }}
                  />
                  <div
                    className="rounded-[1px]"
                    style={{ background: c.amber }}
                  />
                </div>
              </div>
              <span
                className="text-sm font-bold"
                style={{
                  color: c.textPrimary,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                TransitOps
              </span>
            </div>

            <div
              className="flex flex-col items-center text-center gap-3 py-10"
              style={{ animation: "roleDropIn 220ms ease" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(52,211,153,0.12)",
                  border: `1px solid ${c.success}55`,
                }}
              >
                <CircleCheck size={24} style={{ color: c.success }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: c.textPrimary }}
                >
                  Account created
                </p>
                <p className="text-xs mt-1" style={{ color: c.textMuted }}>
                  Redirecting to dashboard…
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden"
      style={{
        background: c.bg,
        fontFamily: "'Inter', ui-sans-serif, system-ui",
      }}
    >
      <style>{`input::placeholder { color: #4a5372; }`}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: c.bgVignette }}
      />

      <div
        className="hidden md:flex md:w-[42%] p-14 flex-col justify-between relative z-10 border-r"
        style={{ background: c.panel, borderColor: c.borderSoft }}
      >
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{
                background: c.amberSoft,
                border: `1.5px solid ${c.amber}66`,
              }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-[3px] w-5 h-5">
                <div
                  className="rounded-[2px]"
                  style={{ background: c.amber }}
                />
                <div className="rounded-[2px]" style={{ background: c.teal }} />
                <div className="rounded-[2px]" style={{ background: c.teal }} />
                <div
                  className="rounded-[2px]"
                  style={{ background: c.amber }}
                />
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold tracking-tight leading-none"
                style={{
                  color: c.textPrimary,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
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
            style={{
              color: c.textPrimary,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            One console for the whole fleet, gated by role.
          </h1>
          <p
            className="text-sm mt-3 max-w-[280px] leading-relaxed"
            style={{ color: c.textSecondary }}
          >
            Sign up to reach live routing, safety alerts and billing — scoped to
            what your role can see.
          </p>

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
              <div
                key={r.name}
                className="relative flex items-center gap-3 mb-[46px] last:mb-0"
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    left: -18,
                    width: 9,
                    height: 9,
                    background: r.color,
                    boxShadow: `0 0 0 3px ${c.panel}`,
                  }}
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

        <div
          className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase"
          style={{ color: c.textMuted }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{
              background: c.success,
              animation: "blink 2s ease-in-out infinite",
            }}
          />
          System operational · RBAC enabled
        </div>
      </div>

      <div className="w-full md:w-[58%] p-6 md:p-16 flex items-center justify-center relative z-10">
        <div
          className="w-full max-w-md p-8 md:p-9 rounded-2xl"
          style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: c.amberSoft,
                border: `1px solid ${c.amber}66`,
              }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-3.5 h-3.5">
                <div
                  className="rounded-[1px]"
                  style={{ background: c.amber }}
                />
                <div className="rounded-[1px]" style={{ background: c.teal }} />
                <div className="rounded-[1px]" style={{ background: c.teal }} />
                <div
                  className="rounded-[1px]"
                  style={{ background: c.amber }}
                />
              </div>
            </div>
            <span
              className="text-sm font-bold"
              style={{
                color: c.textPrimary,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              TransitOps
            </span>
          </div>

          <h2
            className="text-2xl font-semibold tracking-tight mb-1"
            style={{
              color: c.textPrimary,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Create an account
          </h2>
          <p className="text-sm mt-0.5" style={{ color: c.textSecondary }}>
            Fill the form to create a new account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-2"
                style={{ color: c.textMuted }}
              >
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                placeholder="Your full name"
                style={{
                  background: c.panel,
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                }}
              />
              {errors.name && (
                <div className="text-xs mt-1" style={{ color: c.error }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-2"
                style={{ color: c.textMuted }}
              >
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                placeholder="10-digit phone"
                style={{
                  background: c.panel,
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                }}
              />
              {errors.phone && (
                <div className="text-xs mt-1" style={{ color: c.error }}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-2"
                style={{ color: c.textMuted }}
              >
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                placeholder="you@company.com"
                style={{
                  background: c.panel,
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                }}
              />
              {errors.email && (
                <div className="text-xs mt-1" style={{ color: c.error }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-2"
                style={{ color: c.textMuted }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                placeholder="At least 8 characters"
                style={{
                  background: c.panel,
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                }}
              />
              {errors.password && (
                <div className="text-xs mt-1" style={{ color: c.error }}>
                  {errors.password}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-[11px] font-semibold uppercase mb-2"
                style={{ color: c.textMuted }}
              >
                Role
              </label>
              <RoleSelect value={role} onChange={setRole} />
            </div>

            {role === "Driver" && (
              <>
                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted }}
                  >
                    License number
                  </label>
                  <input
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    placeholder="DL-12345678"
                    style={{
                      background: c.panel,
                      color: c.textPrimary,
                      border: `1px solid ${c.border}`,
                    }}
                  />
                  {errors.licenseNo && (
                    <div className="text-xs mt-1" style={{ color: c.error }}>
                      {errors.licenseNo}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold uppercase mb-2"
                    style={{ color: c.textMuted }}
                  >
                    License expiry
                  </label>
                  <input
                    type="date"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: c.panel,
                      color: c.textPrimary,
                      border: `1px solid ${c.border}`,
                    }}
                  />
                  {errors.licenseExpiry && (
                    <div className="text-xs mt-1" style={{ color: c.error }}>
                      {errors.licenseExpiry}
                    </div>
                  )}
                </div>
              </>
            )}
            {error && (
              <div
                className="text-sm rounded-lg p-3"
                style={{
                  background: c.errorBg,
                  color: c.error,
                  border: `1px solid ${c.errorBorder}`,
                }}
              >
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: c.amber, color: "#1a1200" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
