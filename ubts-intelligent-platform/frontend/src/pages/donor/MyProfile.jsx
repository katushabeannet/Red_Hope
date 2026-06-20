import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  RiCloseLine,
  RiEditLine,
  RiHeartPulseLine,
  RiLockLine,
  RiShieldCheckLine,
  RiUserHeartLine,
} from "react-icons/ri";

import { getDonorProfile, getDonorMedicalRecord, updateDonorProfile } from "../../services/donorService";
import { changePassword } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import AdminLoader from "../../components/common/AdminLoader";

function MyProfile() {
  const { showToast } = useToast();
  const { dark } = useTheme();

  const [profile, setProfile]       = useState(null);
  const [medical, setMedical]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showEdit, setShowEdit]     = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [savingPwd, setSavingPwd]   = useState(false);

  const [formData, setFormData] = useState({
    phone_number: "", gender: "", address: "", date_of_birth: "",
  });
  const [pwdForm, setPwdForm] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const p = await getDonorProfile();
      setProfile(p);
      setFormData({
        phone_number: p.phone_number || "",
        gender: p.gender || "",
        address: p.address || "",
        date_of_birth: p.date_of_birth || "",
      });
      try { setMedical(await getDonorMedicalRecord()); } catch { setMedical(null); }
    } catch {
      showToast({ type: "error", title: "Profile Load Failed", message: "Unable to load your donor profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateDonorProfile(formData);
      await loadProfile();
      setShowEdit(false);
      showToast({ type: "success", title: "Profile Updated", message: "Your profile has been updated successfully." });
    } catch {
      showToast({ type: "error", title: "Update Failed", message: "Your profile could not be updated. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      showToast({ type: "error", title: "Mismatch", message: "New passwords do not match." });
      return;
    }
    try {
      setSavingPwd(true);
      await changePassword({ current_password: pwdForm.current_password, new_password: pwdForm.new_password });
      setShowPwd(false);
      setPwdForm({ current_password: "", new_password: "", confirm_password: "" });
      showToast({ type: "success", title: "Password Changed", message: "Your password has been updated." });
    } catch (err) {
      showToast({ type: "error", title: "Change Failed", message: err.response?.data?.error || "Failed to change password." });
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = (profile?.full_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <AdminLoader text="Loading profile…" />;

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Donor Portal</div>
          <h1 className="page-title rh-display">My Profile</h1>
          <p className="page-desc">View your personal donor information and medical record status.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPwd(true)}>
            <RiLockLine /> Change Password
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowEdit(true)}>
            <RiEditLine /> Edit Profile
          </button>
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="panel" style={{
        background: "linear-gradient(135deg, var(--cr) 0%, var(--cr-dk) 100%)",
        color: "#fff",
        padding: "32px 36px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "rgba(255,255,255,.2)",
            border: "3px solid rgba(255,255,255,.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 34, fontWeight: 800, letterSpacing: "-1px",
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>
              {profile?.full_name || "—"}
            </h2>
            <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 16px" }}>{profile?.email}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {profile?.blood_group && (
                <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 999, padding: "5px 16px", fontSize: 13, fontWeight: 800 }}>
                  {profile.blood_group}
                </span>
              )}
              <span style={{ background: "rgba(255,255,255,.15)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>
                Blood Donor
              </span>
              <span style={{ background: medical ? "rgba(255,255,255,.15)" : "rgba(255,200,0,.25)", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600 }}>
                {medical ? "Medical Record Available" : "Awaiting Medical Record"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info panels ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Personal info */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiUserHeartLine size={16} /></div>
              <div>
                <div className="panel-title">Personal Information</div>
                <div className="panel-sub">Registered donor details</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "Full Name",     value: profile?.full_name },
                { label: "Email",         value: profile?.email },
                { label: "Phone Number",  value: profile?.phone_number },
                { label: "Gender",        value: profile?.gender },
                { label: "Date of Birth", value: profile?.date_of_birth },
                { label: "Address",       value: profile?.address },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: "1px solid var(--border)",
                  gap: 16,
                }}>
                  <span style={{ fontSize: 13, color: "var(--ink-l)", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>
                    {value || <em style={{ color: "var(--ink-l)", fontWeight: 400 }}>Not available</em>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medical info */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon gr"><RiHeartPulseLine size={16} /></div>
              <div>
                <div className="panel-title">Medical Information</div>
                <div className="panel-sub">Recorded by UBTS after screening</div>
              </div>
            </div>
            <span className={`badge ${medical ? "badge-green" : "badge-amber"}`}>
              {medical ? "Recorded" : "Pending"}
            </span>
          </div>
          <div className="panel-body">
            {!medical ? (
              <div style={{
                borderRadius: 12, border: dark ? "1px solid rgba(217,119,6,.3)" : "1px solid #FCD34D", background: dark ? "rgba(217,119,6,.1)" : "#FFFBEB",
                padding: "16px 18px", fontSize: 13, color: dark ? "#FCD34D" : "#92400E", lineHeight: 1.6,
              }}>
                Medical information has not yet been recorded by UBTS. This will be completed after your donation or screening.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Blood Group",     value: profile?.blood_group },
                  { label: "Weight",          value: medical.weight_kg ? `${medical.weight_kg} kg` : null },
                  { label: "Hemoglobin",      value: medical.hemoglobin_level ? `${medical.hemoglobin_level} g/dL` : null },
                  { label: "Last Donation",   value: medical.last_donation_date },
                  { label: "Recent Illness",  value: medical.has_recent_illness ? "Yes" : "No" },
                  { label: "Chronic Condition", value: medical.has_chronic_condition ? "Yes" : "No" },
                  { label: "On Medication",   value: medical.is_on_medication ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 0", borderBottom: "1px solid var(--border)", gap: 16,
                  }}>
                    <span style={{ fontSize: 13, color: "var(--ink-l)", flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>
                      {value || <em style={{ color: "var(--ink-l)", fontWeight: 400 }}>Not recorded</em>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Security info card ── */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon bl"><RiShieldCheckLine size={16} /></div>
            <div>
              <div className="panel-title">Account Security</div>
              <div className="panel-sub">Manage your login credentials</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPwd(true)}>
            <RiLockLine /> Change Password
          </button>
        </div>
        <div className="panel-body">
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(37,99,235,.18)" : "#EFF6FF", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RiLockLine size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>Password</div>
              <div style={{ fontSize: 12, color: "var(--ink-l)" }}>••••••••  —  Last changed: contact UBTS if you've forgotten it</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile modal ── */}
      {showEdit && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: dark ? "#1E293B" : "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
            boxShadow: "0 24px 60px rgba(0,0,0,.2)", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>Edit Profile</h3>
                <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "4px 0 0" }}>Update your contact and personal information.</p>
              </div>
              <button onClick={() => setShowEdit(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-l)", padding: 6, borderRadius: 8 }}>
                <RiCloseLine size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Phone Number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={["Male", "Female", "Other"]}
              />
              <Field label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
              <Field label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Password modal ── */}
      {showPwd && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: dark ? "#1E293B" : "#fff", borderRadius: 20, width: "100%", maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,.2)", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>Change Password</h3>
                <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "4px 0 0" }}>Enter your current password to confirm.</p>
              </div>
              <button onClick={() => setShowPwd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-l)", padding: 6, borderRadius: 8 }}>
                <RiCloseLine size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Current Password" type="password" value={pwdForm.current_password} onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })} />
              <Field label="New Password (min 8 characters)" type="password" value={pwdForm.new_password} onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })} />
              <Field label="Confirm New Password" type="password" value={pwdForm.confirm_password} onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 6 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowPwd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingPwd}>
                  {savingPwd ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: "100%", borderRadius: 10, border: "1.5px solid var(--border)",
          background: "var(--canvas)", padding: "10px 14px",
          fontSize: 13, color: "var(--ink)", outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--cr)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", borderRadius: 10, border: "1.5px solid var(--border)",
          background: "var(--canvas)", padding: "10px 14px",
          fontSize: 13, color: "var(--ink)", outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--cr)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
      >
        <option value="">Select…</option>
        {options.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

export default MyProfile;
