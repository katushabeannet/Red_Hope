import { useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { RiSunLine, RiMoonLine, RiCheckLine } from "react-icons/ri";

import { resetPassword } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const STRENGTH_CLS   = ["", "weak", "fair", "fair", "good"];
const STRENGTH_LABEL = ["", "Too weak", "Fair", "Good", "Strong ✓"];
const STRENGTH_CLR   = ["", "#E53E3E", "#D97706", "#D97706", "#16A34A"];

function AuthDrop() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="url(#resetDrop)" />
      <path d="M12 28.5C12 33 14.6 36 18 36" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="resetDrop" x1="18" y1="2" x2="18" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8314F" /><stop offset="1" stopColor="#6B0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BtnSpinner() {
  return <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [formData, setFormData]   = useState({ new_password: "", confirm_password: "" });
  const [showPw, setShowPw]       = useState(false);
  const [showPw2, setShowPw2]     = useState(false);
  const [pwStrength, setPwStrength] = useState(0);
  const [loading, setLoading]     = useState(false);
  const [errMsg, setErrMsg]       = useState("");
  const [done, setDone]           = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrMsg("");
    if (name === "new_password") {
      let score = 0;
      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setPwStrength(score);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (formData.new_password.length < 8) { setErrMsg("Password must be at least 8 characters."); return; }
    if (formData.new_password !== formData.confirm_password) { setErrMsg("Passwords do not match."); return; }
    try {
      setLoading(true);
      await resetPassword({ uid, token, new_password: formData.new_password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrMsg(err.response?.data?.error || "Reset link is invalid or has expired. Please request a new one.");
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
              Almost <span style={{ color: "#FFD0DA" }}>There.</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
              Choose a strong new password for your RedHope donor account.
              Once reset, you'll be redirected to sign in automatically.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Choose a strong password (8+ chars)", "Mix letters, numbers & symbols", "Your account data stays fully intact", "You'll be redirected to sign in"].map((f) => (
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
          {done ? (
            /* ── SUCCESS ── */
            <div style={{ textAlign: "center", padding: "20px 0", animation: "rh-fadeup .5s cubic-bezier(.16,1,.3,1) both" }}>
              <div style={{ width: 74, height: 74, borderRadius: "50%", background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                <RiCheckLine size={34} style={{ color: "var(--cr)" }} />
              </div>
              <h2 className="rh-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>Password Reset!</h2>
              <p style={{ fontSize: 14, color: "var(--ink-l)", lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been changed successfully. Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 36px", borderRadius: 12, background: "linear-gradient(135deg, var(--cr), var(--cr-dk))", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 18px rgba(196,30,58,.3)" }}
              >
                Sign In Now →
              </Link>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              <div style={{ width: 58, height: 58, borderRadius: 16, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>🔐</div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Almost Done</p>
              <h1 className="rh-display" style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>Set a New Password</h1>
              <p style={{ fontSize: 14, color: "var(--ink-l)", marginBottom: 28, lineHeight: 1.6 }}>
                Choose a strong new password to secure your donor account.
              </p>

              {errMsg && <div className="auth-flash danger"><span>⚠</span><span>{errMsg}</span></div>}

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label>New Password</label>
                  <input type={showPw ? "text" : "password"} name="new_password" value={formData.new_password} onChange={handleChange} placeholder="Minimum 8 characters" style={{ paddingRight: 64 }} />
                  <button type="button" className="auth-toggle-pw" onClick={() => setShowPw((p) => !p)}>{showPw ? "Hide" : "Show"}</button>
                  {formData.new_password && (
                    <>
                      <div className="auth-pw-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`auth-pw-seg ${i <= pwStrength ? STRENGTH_CLS[pwStrength] : ""}`} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, marginTop: 5, color: STRENGTH_CLR[pwStrength] }}>{STRENGTH_LABEL[pwStrength]}</p>
                    </>
                  )}
                </div>

                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <input type={showPw2 ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Re-enter your new password" style={{ paddingRight: 64 }} />
                  <button type="button" className="auth-toggle-pw" onClick={() => setShowPw2((p) => !p)}>{showPw2 ? "Hide" : "Show"}</button>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <Link to="/forgot-password" className="auth-back-btn" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>← Request new link</Link>
                  <button type="submit" className="auth-submit" disabled={loading} style={{ flex: 1 }}>
                    {loading ? <><BtnSpinner /> Resetting…</> : "Reset Password →"}
                  </button>
                </div>
              </form>

              <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--rh-border)" }}>
                <Link to="/" style={{ fontSize: 12.5, color: "var(--ink-l)", textDecoration: "none" }}>← Back to RedHope Home</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
