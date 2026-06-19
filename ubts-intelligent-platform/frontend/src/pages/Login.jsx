import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RiSunLine, RiMoonLine } from "react-icons/ri";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  "AI-powered eligibility check in seconds",
  "Nearest donation camp matched to you",
  "Personal dashboard & impact tracker",
  "Donor recognition badges & certificates",
];

function AuthDrop() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="url(#loginDrop)" />
      <path d="M12 28.5C12 33 14.6 36 18 36" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="loginDrop" x1="18" y1="2" x2="18" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8314F" /><stop offset="1" stopColor="#6B0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BtnSpinner() {
  return <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { dark, toggle } = useTheme();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (!formData.email || !formData.email.includes("@")) { setErrMsg("Please enter a valid email address."); return; }
    if (formData.password.length < 6) { setErrMsg("Password must be at least 6 characters."); return; }
    try {
      setLoading(true);
      const data = await loginUser(formData);
      const loggedInUser = data.user || data;
      login(loggedInUser);
      showToast({ type: "success", title: "Welcome back!", message: `Signed in as ${loggedInUser.full_name || loggedInUser.email}.` });
      navigate(loggedInUser.role === "ADMIN" ? "/admin-dashboard" : "/donor-dashboard");
    } catch (err) {
      setErrMsg(err.response?.data?.detail || err.response?.data?.error || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div
        className="auth-left"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <svg className="auth-deco-drop d1" viewBox="0 0 36 44" fill="none"><path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="white" /></svg>
        <svg className="auth-deco-drop d2" viewBox="0 0 36 44" fill="none"><path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="white" /></svg>

        <div className="auth-float-stat s1">
          <div className="rh-display" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>85K+</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 500, marginTop: 3 }}>Lives Impacted</div>
        </div>
        <div className="auth-float-stat s2">
          <div className="rh-display" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>12K+</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 500, marginTop: 3 }}>Active Donors</div>
        </div>

        <div className="auth-left-inner">
          <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div className="animate-rh-float"><AuthDrop /></div>
            <div>
              <div className="rh-display" style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>RedHope</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 500, letterSpacing: ".06em" }}>One Drop. One Life. One Hope.</div>
            </div>
          </NavLink>

          <div style={{ margin: "auto 0", padding: "20px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.85)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
              Donor Portal
            </div>
            <h2 className="rh-display" style={{ fontSize: "clamp(28px,3.2vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
              Welcome<br />Back, <span style={{ color: "#FFD0DA" }}>Hero.</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
              Sign back in to track your donation history, check your eligibility,
              and find your nearest active blood drive — all powered by RedHope AI.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FEATURES.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,.82)", fontSize: 13.5 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {["UBTS Certified", "256-bit Encrypted", "Makerere University"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.55)", fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <button onClick={toggle} style={{ position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--rh-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-s)" }} aria-label="Toggle dark mode">
          {dark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
        </button>

        <div className="auth-form-box">
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Donor Access</p>
          <h1 className="rh-display" style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>Sign In</h1>
          <p style={{ fontSize: 14, color: "var(--ink-l)", marginBottom: 30 }}>
            New to RedHope?{" "}
            <Link to="/register" style={{ color: "var(--cr)", fontWeight: 600, textDecoration: "none" }}>Create a free account →</Link>
          </p>

          {errMsg && <div className="auth-flash danger"><span>⚠</span><span>{errMsg}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="donor@email.com" autoComplete="email" />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input type={showPw ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" style={{ paddingRight: 64 }} />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowPw((p) => !p)}>{showPw ? "Hide" : "Show"}</button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24, marginTop: -6 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--cr)", textDecoration: "none", fontWeight: 600 }}>Forgot password?</Link>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><BtnSpinner /> Signing in…</> : "Sign In to RedHope →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--rh-border)" }}>
            <Link to="/" style={{ fontSize: 12.5, color: "var(--ink-l)", textDecoration: "none" }}>← Back to RedHope Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
