import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiUserAddLine,
  RiHeartPulseLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiEyeLine,
  RiEyeOffLine,
  RiGroupLine,
  RiCheckLine,
} from "react-icons/ri";
import { useTheme } from "../../context/ThemeContext";
import { registerWalkInDonor } from "../../services/adminDonorService";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const STEPS = [
  { id: 1, label: "Personal Info",    icon: RiUserAddLine },
  { id: 2, label: "Medical Details",  icon: RiHeartPulseLine },
  { id: 3, label: "Review & Submit",  icon: RiCheckboxCircleLine },
];

const emptyPersonal = {
  full_name: "",
  email: "",
  password: "",
  phone_number: "",
  gender: "",
  date_of_birth: "",
  blood_group: "O+",
  address: "",
  whatsapp_number: "",
  whatsapp_consent: false,
};

const emptyMedical = {
  weight_kg: "",
  hemoglobin_level: "",
  last_donation_date: "",
  has_recent_illness: false,
  has_chronic_condition: false,
  is_pregnant: false,
  is_on_medication: false,
};

export default function WalkInDonorRegistration() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState(emptyPersonal);
  const [medical, setMedical] = useState(emptyMedical);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handlePersonalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPersonal((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMedicalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMedical((m) => ({ ...m, [name]: type === "checkbox" ? checked : value }));
  };

  const validateStep1 = () => {
    if (!personal.full_name.trim()) return "Full name is required.";
    if (!personal.email.trim() || !personal.email.includes("@")) return "Valid email is required.";
    if (!personal.password || personal.password.length < 6) return "Password must be at least 6 characters.";
    if (!personal.blood_group) return "Blood group is required.";
    return null;
  };

  const goNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setError("");
    setStep((s) => s + 1);
  };

  const goBack = () => { setError(""); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...personal,
        ...medical,
        weight_kg:        medical.weight_kg        ? Number(medical.weight_kg)        : null,
        hemoglobin_level: medical.hemoglobin_level ? Number(medical.hemoglobin_level) : null,
        last_donation_date: medical.last_donation_date || null,
      };
      const result = await registerWalkInDonor(payload);
      setSuccess(result);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndAddAnother = () => {
    setPersonal(emptyPersonal);
    setMedical(emptyMedical);
    setSuccess(null);
    setError("");
    setStep(1);
  };

  const surface = dark ? "#1E293B" : "#fff";
  const borderC = dark ? "#334155" : "#e2e8f0";
  const inputBg = dark ? "#0F172A" : "#F7F8FC";
  const labelC  = dark ? "#94A3B8" : "#64748b";
  const inkC    = dark ? "#F1F5F9" : "#0F172A";

  const inputStyle = {
    width: "100%", borderRadius: 10, border: `1.5px solid ${borderC}`,
    background: inputBg, padding: "11px 14px", fontSize: 14,
    color: inkC, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const checkboxRowStyle = {
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${borderC}`,
    background: inputBg, userSelect: "none",
  };

  if (success) {
    return (
      <div style={{ maxWidth: 540, margin: "60px auto", padding: 16 }}>
        <div style={{ background: surface, borderRadius: 20, padding: 48, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,.08)" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(22,163,74,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <RiCheckLine size={36} color="var(--green,#16a34a)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: inkC, margin: "0 0 8px" }}>Donor Registered!</h2>
          <p style={{ color: labelC, fontSize: 14, margin: "0 0 4px" }}><strong style={{ color: inkC }}>{success.user?.full_name}</strong> has been successfully registered.</p>
          <p style={{ color: labelC, fontSize: 13, margin: "0 0 32px" }}>Email: {success.user?.email}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={resetAndAddAnother}>
              <RiUserAddLine /> Register Another
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/admin-donors")}>
              <RiGroupLine /> View Donor List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Walk-In Registration</div>
          <h1 className="page-title rh-display">Register Walk-In Donor</h1>
          <p className="page-desc">Register donors who arrive at donation camps. Creates their account, profile, and optional medical record in one flow.</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, maxWidth: 560 }}>
        {STEPS.map((s, i) => {
          const done    = step > s.id;
          const active  = step === s.id;
          const Icon    = s.icon;
          const dotBg   = done ? "var(--green,#16a34a)" : active ? "var(--cr,#C0162C)" : (dark ? "#334155" : "#e2e8f0");
          const dotText = done || active ? "#fff" : labelC;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: dotBg, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}>
                  {done ? <RiCheckLine size={18} color="#fff" /> : <Icon size={18} color={dotText} />}
                </div>
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "var(--cr,#C0162C)" : labelC, whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.id ? "var(--green,#16a34a)" : borderC, margin: "0 8px", marginBottom: 20, transition: "background .2s" }} />
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="adm-alert adm-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="panel" style={{ maxWidth: 720 }}>
        <div className="panel-body">

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionTitle>Account &amp; Personal Information</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="Full Name *" style={{ gridColumn: "1 / -1" }}>
                  <input name="full_name" value={personal.full_name} onChange={handlePersonalChange} placeholder="e.g. John Doe" style={inputStyle} required />
                </FormField>
                <FormField label="Email Address *">
                  <input name="email" type="email" value={personal.email} onChange={handlePersonalChange} placeholder="donor@example.com" style={inputStyle} required />
                </FormField>
                <FormField label="Password *">
                  <div style={{ position: "relative" }}>
                    <input
                      name="password" type={showPassword ? "text" : "password"}
                      value={personal.password} onChange={handlePersonalChange}
                      placeholder="Min. 6 characters"
                      style={{ ...inputStyle, paddingRight: 42 }} required
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: labelC, display: "flex" }}>
                      {showPassword ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
                    </button>
                  </div>
                </FormField>
                <FormField label="Phone Number">
                  <input name="phone_number" value={personal.phone_number} onChange={handlePersonalChange} placeholder="0700000000" style={inputStyle} />
                </FormField>
                <FormField label="Gender">
                  <select name="gender" value={personal.gender} onChange={handlePersonalChange} style={inputStyle}>
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FormField>
                <FormField label="Date of Birth">
                  <input name="date_of_birth" type="date" value={personal.date_of_birth} onChange={handlePersonalChange} style={inputStyle} />
                </FormField>
                <FormField label="Blood Group *">
                  <select name="blood_group" value={personal.blood_group} onChange={handlePersonalChange} style={inputStyle}>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </FormField>
                <FormField label="Address / District" style={{ gridColumn: "1 / -1" }}>
                  <input name="address" value={personal.address} onChange={handlePersonalChange} placeholder="e.g. Kampala, Central Uganda" style={inputStyle} />
                </FormField>
                <FormField label="WhatsApp Number">
                  <input name="whatsapp_number" value={personal.whatsapp_number} onChange={handlePersonalChange} placeholder="Leave blank if same as phone" style={inputStyle} />
                </FormField>
                <FormField label="WhatsApp Consent">
                  <label style={checkboxRowStyle} onClick={() => setPersonal((p) => ({ ...p, whatsapp_consent: !p.whatsapp_consent }))}>
                    <input type="checkbox" name="whatsapp_consent" checked={personal.whatsapp_consent} onChange={handlePersonalChange} style={{ accentColor: "var(--cr,#C0162C)", width: 16, height: 16 }} />
                    <span style={{ fontSize: 13, color: inkC }}>Donor consents to WhatsApp notifications</span>
                  </label>
                </FormField>
              </div>
            </div>
          )}

          {/* ── Step 2: Medical Details ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionTitle>Medical Information <span style={{ fontSize: 13, fontWeight: 400, color: labelC }}>(optional — can be added later)</span></SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="Weight (kg)">
                  <input name="weight_kg" type="number" step="0.1" min="1" value={medical.weight_kg} onChange={handleMedicalChange} placeholder="e.g. 70" style={inputStyle} />
                </FormField>
                <FormField label="Hemoglobin Level (g/dL)">
                  <input name="hemoglobin_level" type="number" step="0.1" min="0" value={medical.hemoglobin_level} onChange={handleMedicalChange} placeholder="e.g. 13.5" style={inputStyle} />
                </FormField>
                <FormField label="Last Donation Date" style={{ gridColumn: "1 / -1" }}>
                  <input name="last_donation_date" type="date" value={medical.last_donation_date} onChange={handleMedicalChange} style={inputStyle} />
                </FormField>
                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { name: "has_recent_illness",   label: "Has had recent illness" },
                    { name: "has_chronic_condition", label: "Has chronic condition" },
                    { name: "is_on_medication",      label: "Currently on medication" },
                    { name: "is_pregnant",           label: "Currently pregnant" },
                  ].map(({ name, label }) => (
                    <label key={name} style={checkboxRowStyle} onClick={() => setMedical((m) => ({ ...m, [name]: !m[name] }))}>
                      <input type="checkbox" name={name} checked={medical[name]} onChange={handleMedicalChange} style={{ accentColor: "var(--cr,#C0162C)", width: 16, height: 16, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: inkC }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <SectionTitle>Review &amp; Confirm</SectionTitle>
              <ReviewSection title="Account & Personal" dark={dark} surface={surface} borderC={borderC} labelC={labelC} inkC={inkC}>
                <ReviewRow label="Full Name"    value={personal.full_name}    labelC={labelC} inkC={inkC} />
                <ReviewRow label="Email"        value={personal.email}         labelC={labelC} inkC={inkC} />
                <ReviewRow label="Phone"        value={personal.phone_number || "—"}  labelC={labelC} inkC={inkC} />
                <ReviewRow label="Gender"       value={personal.gender || "—"}        labelC={labelC} inkC={inkC} />
                <ReviewRow label="Date of Birth" value={personal.date_of_birth || "—"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="Blood Group"  value={personal.blood_group}   labelC={labelC} inkC={inkC} />
                <ReviewRow label="Address"      value={personal.address || "—"}       labelC={labelC} inkC={inkC} />
              </ReviewSection>
              <ReviewSection title="Medical Details" dark={dark} surface={surface} borderC={borderC} labelC={labelC} inkC={inkC}>
                <ReviewRow label="Weight (kg)"          value={medical.weight_kg || "Not provided"}        labelC={labelC} inkC={inkC} />
                <ReviewRow label="Hemoglobin (g/dL)"    value={medical.hemoglobin_level || "Not provided"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="Last Donation"        value={medical.last_donation_date || "Not provided"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="Recent Illness"       value={medical.has_recent_illness   ? "Yes" : "No"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="Chronic Condition"    value={medical.has_chronic_condition ? "Yes" : "No"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="On Medication"        value={medical.is_on_medication      ? "Yes" : "No"} labelC={labelC} inkC={inkC} />
                <ReviewRow label="Pregnant"             value={medical.is_pregnant           ? "Yes" : "No"} labelC={labelC} inkC={inkC} />
              </ReviewSection>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, flexWrap: "wrap", gap: 12 }}>
            <div>
              {step > 1 && (
                <button className="btn btn-outline" onClick={goBack} disabled={loading}>
                  <RiArrowLeftLine /> Back
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {step < 3 && (
                <button className="btn btn-primary" onClick={goNext}>
                  {step === 2 ? "Review" : "Next"} <RiArrowRightLine />
                </button>
              )}
              {step === 3 && (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <span className="btn-spin" /> : <RiCheckLine />}
                  {loading ? "Registering…" : "Register Donor"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", borderBottom: "2px solid var(--cr,#C0162C)", paddingBottom: 8, display: "inline-block" }}>
      {children}
    </div>
  );
}

function FormField({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-s)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

function ReviewSection({ title, children, dark, surface, borderC, labelC }) {
  return (
    <div style={{ borderRadius: 14, border: `1.5px solid ${borderC}`, overflow: "hidden" }}>
      <div style={{ background: dark ? "#0F172A" : "#F8FAFF", padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "var(--cr,#C0162C)", letterSpacing: "0.03em" }}>{title}</div>
      <div style={{ background: surface, padding: "4px 0" }}>{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, labelC, inkC }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(148,163,184,.08)" }}>
      <span style={{ fontSize: 13, color: labelC, minWidth: 160 }}>{label}</span>
      <span style={{ fontSize: 13, color: inkC, fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
