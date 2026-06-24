import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { RiSunLine, RiMoonLine, RiCheckLine } from "react-icons/ri";

import { forgotPassword } from "../../services/authService";
import { v } from "../../utils/validators";
import { useTheme } from "../../context/ThemeContext";
import redHopeLogo from "../../assets/logo/redhope.png";

const FEATURES = [
  "Secure one-time password reset link",
  "Link expires automatically for safety",
  "Your donor history stays fully intact",
  "256-bit encrypted, end to end",
];

function AuthDrop() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="url(#forgotDrop)" />
      <path d="M12 28.5C12 33 14.6 36 18 36" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="forgotDrop" x1="18" y1="2" x2="18" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8314F" /><stop offset="1" stopColor="#6B0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BtnSpinner() {
  return <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function ForgotPassword() {
  const { dark, toggle } = useTheme();
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    const emailErr = v.email(email);
    if (emailErr) { setErrMsg(emailErr); return; }
    try {
      setLoading(true);
      await forgotPassword(email);
      setSent(true);
    } catch {
      setErrMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div
        className="auth-left"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
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
              Account Recovery
            </div>
            <h2 className="rh-display" style={{ fontSize: "clamp(28px,3.2vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
              Let's Get You<br />Back <span style={{ color: "#FFD0DA" }}>In.</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
              It happens to everyone. Enter your email and we'll send you a secure
              link to reset your password and get back to saving lives.
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
        {/* Logo watermark */}
        <img src={redHopeLogo} alt="" aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "55%", maxWidth: 320, opacity: 0.055, pointerEvents: "none", userSelect: "none", zIndex: 0 }} />

        <button onClick={toggle} style={{ position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--rh-border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-s)", zIndex: 2 }} aria-label="Toggle dark mode">
          {dark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
        </button>

        <div className="auth-form-box" style={{ position: "relative", zIndex: 1 }}>
          {sent ? (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign: "center", padding: "20px 0", animation: "rh-fadeup .5s cubic-bezier(.16,1,.3,1) both" }}>
              <div style={{ width: 74, height: 74, borderRadius: "50%", background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                <RiCheckLine size={34} style={{ color: "var(--cr)" }} />
              </div>
              <h2 className="rh-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>Check Your Inbox</h2>
              <p style={{ fontSize: 14, color: "var(--ink-l)", lineHeight: 1.7, marginBottom: 28 }}>
                If an account with <strong style={{ color: "var(--ink)" }}>{email}</strong> exists, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 36px", borderRadius: 12, background: "linear-gradient(135deg, var(--cr), var(--cr-dk))", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 18px rgba(196,30,58,.3)" }}
              >
                Back to Sign In →
              </Link>
              <div style={{ marginTop: 20 }}>
                <Link to="/" style={{ fontSize: 12.5, color: "var(--ink-l)", textDecoration: "none" }}>← Back to RedHope Home</Link>
              </div>
            </div>
          ) : (
            /* ── EMAIL FORM ── */
            <>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>
                📧
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Account Recovery</p>
              <h1 className="rh-display" style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>Forgot Password?</h1>
              <p style={{ fontSize: 14, color: "var(--ink-l)", marginBottom: 28, lineHeight: 1.6 }}>
                No worries — enter the email linked to your RedHope account and we'll send you a password reset link.
              </p>

              {errMsg && <div className="auth-flash danger"><span>⚠</span><span>{errMsg}</span></div>}

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrMsg(""); }} placeholder="your@email.com" autoComplete="email" />
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <><BtnSpinner /> Sending…</> : "Send Reset Link →"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: "var(--ink-l)" }}>
                Remembered your password?{" "}
                <Link to="/login" style={{ color: "var(--cr)", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
              </p>
              <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--rh-border)" }}>
                <Link to="/" style={{ fontSize: 12.5, color: "var(--ink-l)", textDecoration: "none" }}>← Back to RedHope Home</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
