import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RiSunLine, RiMoonLine } from "react-icons/ri";

import { registerUser } from "../../services/authService";
import { createDonorProfile } from "../../services/donorService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";

const BLOOD_TYPES = ["O-", "AB-", "O+", "A+", "B+", "A-", "B-", "AB+"];
const HIGHLIGHT = ["O-", "AB-"];

const STRENGTH_CLS   = ["", "weak", "fair", "fair", "good"];
const STRENGTH_LABEL = ["", "Too weak", "Fair", "Good", "Strong ✓"];
const STRENGTH_CLR   = ["", "#E53E3E", "#D97706", "#D97706", "#16A34A"];

function AuthDrop() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="url(#regDrop)" />
      <path d="M12 28.5C12 33 14.6 36 18 36" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="regDrop" x1="18" y1="2" x2="18" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8314F" /><stop offset="1" stopColor="#6B0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BtnSpinner() {
  return <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />;
}

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { dark, toggle } = useTheme();

  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [errMsg, setErrMsg]         = useState("");
  const [termsOk, setTermsOk]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showPw2, setShowPw2]       = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone_number: "",
    date_of_birth: "", gender: "", address: "",
    password: "", confirm_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrMsg("");
    if (name === "password") {
      let score = 0;
      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setPwStrength(score);
    }
  };

  const validateStep1 = () => {
    if (!formData.full_name.trim()) { setErrMsg("Full name is required."); return false; }
    if (!formData.email || !formData.email.includes("@")) { setErrMsg("A valid email address is required."); return false; }
    if (!formData.phone_number.trim()) { setErrMsg("Phone number is required."); return false; }
    if (!formData.date_of_birth) { setErrMsg("Date of birth is required."); return false; }
    if (!formData.gender) { setErrMsg("Please select your gender."); return false; }
    return true;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setErrMsg("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (formData.password.length < 8) { setErrMsg("Password must be at least 8 characters."); return; }
    if (formData.password !== formData.confirm_password) { setErrMsg("Passwords do not match."); return; }
    if (!termsOk) { setErrMsg("Please accept the Terms of Service to continue."); return; }
    try {
      setLoading(true);
      const registerData = await registerUser({
        email: formData.email,
        username: formData.email.split("@")[0],
        full_name: formData.full_name,
        password: formData.password,
        role: "DONOR",
      });
      const loggedInUser = registerData.user || registerData;
      login(loggedInUser);
      await createDonorProfile({
        phone_number: formData.phone_number,
        blood_group: "O+",
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address || "",
      });
      showToast({ type: "success", title: "Registration Successful", message: "Your donor account has been created." });
      navigate("/donor-dashboard");
    } catch (err) {
      setErrMsg(
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div
        className="auth-left"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <svg className="auth-deco-drop d1" viewBox="0 0 36 44" fill="none"><path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="white" /></svg>
        <svg className="auth-deco-drop d2" viewBox="0 0 36 44" fill="none"><path d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z" fill="white" /></svg>

        <div className="auth-left-inner">
          <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div className="animate-rh-float"><AuthDrop /></div>
            <div>
              <div className="rh-display" style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>RedHope</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", fontWeight: 500, letterSpacing: ".06em" }}>One Drop. One Life. One Hope.</div>
            </div>
          </NavLink>

          <div style={{ margin: "auto 0", padding: "24px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.85)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 20, marginBottom: 22 }}>
              Join the Community
            </div>
            <h2 className="rh-display" style={{ fontSize: "clamp(26px,3vw,42px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
              Save Lives.<br />Be a <span style={{ color: "#FFD0DA" }}>RedHope</span><br />Donor.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.75, maxWidth: 340, marginBottom: 24 }}>
              Register in minutes. Your blood type matters — no matter what it is,
              there's a patient who needs you. Join 12,000+ donors across Uganda.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BLOOD_TYPES.map((t) => (
                <span key={t} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,.2)", background: HIGHLIGHT.includes(t) ? "rgba(196,30,58,.2)" : "rgba(255,255,255,.08)", color: HIGHLIGHT.includes(t) ? "#FFD0DA" : "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["Free to Register", "UBTS Verified", "Data Encrypted"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.5)", fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.25)" }} />{t}
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
          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div className="auth-progress">
              <div className="auth-ps-item">
                <div className={`auth-ps-circle ${step > 1 ? "done" : "active"}`}>{step > 1 ? "✓" : "1"}</div>
                <div className={`auth-ps-line ${step > 1 ? "done" : ""}`} />
              </div>
              <div className="auth-ps-item" style={{ flex: 0 }}>
                <div className={`auth-ps-circle ${step === 2 ? "active" : ""}`}>2</div>
              </div>
            </div>
            <div className="auth-ps-labels">
              <div className={`auth-ps-label ${step === 1 ? "active" : ""}`}>Personal Info</div>
              <div className={`auth-ps-label ${step === 2 ? "active" : ""}`}>Security</div>
            </div>
          </div>

          {errMsg && <div className="auth-flash danger"><span>⚠</span><span>{errMsg}</span></div>}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ animation: "rh-fadeup .4s cubic-bezier(.16,1,.3,1) both" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 8 }}>Step 1 of 2</p>
              <h1 className="rh-display" style={{ fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>Personal Information</h1>
              <p style={{ fontSize: 13.5, color: "var(--ink-l)", marginBottom: 24 }}>
                Already registered?{" "}
                <Link to="/login" style={{ color: "var(--cr)", fontWeight: 600, textDecoration: "none" }}>Sign in here →</Link>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Full Name *</label>
                  <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Aisha Namukwaya" />
                </div>
                <div className="auth-field">
                  <label>Date of Birth *</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                </div>
                <div className="auth-field">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Phone Number *</label>
                  <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+256 700 000 000" />
                </div>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="aisha@email.com" autoComplete="email" />
                </div>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} placeholder="Kampala, Uganda" />
                </div>
              </div>

              <button type="button" className="auth-submit" onClick={handleNext}>Continue →</button>

              <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--rh-border)" }}>
                <Link to="/" style={{ fontSize: 12, color: "var(--ink-l)", textDecoration: "none" }}>← Back to RedHope Home</Link>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ animation: "rh-fadeup .4s cubic-bezier(.16,1,.3,1) both" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 8 }}>Step 2 of 2</p>
              <h1 className="rh-display" style={{ fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>Create Your Password</h1>
              <p style={{ fontSize: 13.5, color: "var(--ink-l)", marginBottom: 24 }}>Almost there — set a strong password to secure your account.</p>

              <div className="auth-field">
                <label>Password *</label>
                <input type={showPw ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" style={{ paddingRight: 64 }} />
                <button type="button" className="auth-toggle-pw" onClick={() => setShowPw((p) => !p)}>{showPw ? "Hide" : "Show"}</button>
                {formData.password && (
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
                <label>Confirm Password *</label>
                <input type={showPw2 ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Re-enter your password" style={{ paddingRight: 64 }} />
                <button type="button" className="auth-toggle-pw" onClick={() => setShowPw2((p) => !p)}>{showPw2 ? "Hide" : "Show"}</button>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, fontSize: 13, color: "var(--ink-s)" }}>
                <input type="checkbox" id="terms" checked={termsOk} onChange={(e) => setTermsOk(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--cr)", cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
                <label htmlFor="terms">
                  I agree to the{" "}
                  <a href="#" style={{ color: "var(--cr)", textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>{" "}and{" "}
                  <a href="#" style={{ color: "var(--cr)", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>{" "}of RedHope AI and the Uganda Blood Transfusion Service.
                </label>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="auth-back-btn" onClick={() => { setStep(1); setErrMsg(""); }}>← Back</button>
                <button type="submit" className="auth-submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? <><BtnSpinner /> Creating account…</> : "Create Account →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
