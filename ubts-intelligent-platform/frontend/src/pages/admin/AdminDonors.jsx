import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  RiAlarmWarningLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiHeartPulseLine,
  RiRefreshLine,
  RiSearchLine,
  RiUserHeartLine,
} from "react-icons/ri";

import {
  exportDonorsCSV,
  getAdminDonors,
  getAdminLapsedDonors,
  recordDonation,
  saveAdminMedicalRecord,
} from "../../services/adminDonorService";
import { blastCampaignNotification } from "../../services/notificationService";

const initialMedicalForm = {
  donor_id: "",
  blood_group: "O+",
  weight_kg: "",
  hemoglobin_level: "",
  has_recent_illness: false,
  has_chronic_condition: false,
  last_donation_date: "",
  is_pregnant: false,
  is_on_medication: false,
};

const initialDonationForm = { donor_id: "", donation_date: "", camp_name: "", notes: "" };

function AdminDonors() {
  const { dark } = useTheme();
  const [donors, setDonors]         = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 });
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedDonor, setSelectedDonor]     = useState(null);
  const [formData, setFormData]               = useState(initialMedicalForm);
  const [donationForm, setDonationForm]       = useState(initialDonationForm);
  const [showDonationForm, setShowDonationForm] = useState(false);

  const [loading, setLoading]                     = useState(true);
  const [saving, setSaving]                       = useState(false);
  const [recordingDonation, setRecordingDonation] = useState(false);
  const [error, setError]                         = useState("");
  const [success, setSuccess]                     = useState("");

  const [showLapsed, setShowLapsed]   = useState(false);
  const [lapsedDonors, setLapsedDonors] = useState([]);
  const [lapsedTotal, setLapsedTotal] = useState(0);
  const [lapsedLoading, setLapsedLoading] = useState(false);
  const [blastTitle, setBlastTitle]   = useState("We Miss You — Come Back and Donate!");
  const [blastMessage, setBlastMessage] = useState(
    "It has been over 6 months since your last donation. Your blood can save lives — visit the nearest UBTS camp and donate today."
  );
  const [blasting, setBlasting]       = useState(false);

  const loadDonors = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getAdminDonors({ page, search, page_size: 20 });
      setDonors(data.results);
      setPagination({ total: data.total, page: data.page, total_pages: data.total_pages });
    } catch {
      setError("Failed to load donors.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadDonors(); }, [loadDonors]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setSearch(searchInput); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    setSuccess("");
    setError("");
    setFormData({
      donor_id: donor.id,
      blood_group: donor.blood_group || "O+",
      weight_kg: donor.medical_record?.weight_kg || "",
      hemoglobin_level: donor.medical_record?.hemoglobin_level || "",
      has_recent_illness: donor.medical_record?.has_recent_illness || false,
      has_chronic_condition: donor.medical_record?.has_chronic_condition || false,
      last_donation_date: donor.medical_record?.last_donation_date || "",
      is_pregnant: donor.medical_record?.is_pregnant || false,
      is_on_medication: donor.medical_record?.is_on_medication || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveMedicalRecord = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await saveAdminMedicalRecord({
        ...formData,
        weight_kg: Number(formData.weight_kg),
        hemoglobin_level: Number(formData.hemoglobin_level),
        last_donation_date: formData.last_donation_date || null,
      });
      setSuccess("Medical information saved successfully.");
      await loadDonors();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save donor medical information.");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    try {
      setRecordingDonation(true);
      setError("");
      setSuccess("");
      const result = await recordDonation({
        donor_id: Number(donationForm.donor_id),
        donation_date: donationForm.donation_date,
        camp_name: donationForm.camp_name,
        notes: donationForm.notes,
      });
      setSuccess(`Donation recorded. ${result.donor_name} now has ${result.total_donations} donation(s).`);
      setShowDonationForm(false);
      setDonationForm(initialDonationForm);
      await loadDonors();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record donation.");
    } finally {
      setRecordingDonation(false);
    }
  };

  const loadLapsedDonors = async () => {
    try {
      setLapsedLoading(true);
      const data = await getAdminLapsedDonors({ page_size: 50 });
      setLapsedDonors(data.results || []);
      setLapsedTotal(data.total || 0);
    } catch {
      setError("Failed to load lapsed donors.");
    } finally {
      setLapsedLoading(false);
    }
  };

  const handleToggleLapsed = () => {
    const next = !showLapsed;
    setShowLapsed(next);
    if (next && lapsedDonors.length === 0) loadLapsedDonors();
  };

  const handleBlastLapsed = async (e) => {
    e.preventDefault();
    if (!blastTitle.trim() || !blastMessage.trim()) return;
    const ids = lapsedDonors.map((d) => d.id);
    if (ids.length === 0) return;
    try {
      setBlasting(true);
      setError("");
      const result = await blastCampaignNotification({ donor_ids: ids, title: blastTitle, message: blastMessage });
      setSuccess(`Blast sent to ${result.sent_count ?? ids.length} lapsed donor(s).`);
    } catch {
      setError("Failed to send blast notification.");
    } finally {
      setBlasting(false);
    }
  };

  const donorsWithMedical   = donors.filter((d) => d.medical_record).length;
  const donorsPendingMedical = pagination.total - donorsWithMedical;

  return (
    <>
      {/* Page header */}
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Donor Medical Management</div>
          <h1 className="page-title rh-display">Donors &amp; Medical Records</h1>
          <p className="page-desc">View registered donors and record their medical information after UBTS screening or donation.</p>
        </div>
        <div className="page-actions">
          <button
            className={`btn ${showLapsed ? "btn-primary" : "btn-outline"}`}
            onClick={handleToggleLapsed}
          >
            <RiAlarmWarningLine size={16} /> Lapsed Donors
          </button>
          <button className="btn btn-outline" onClick={loadDonors}>
            <RiRefreshLine size={16} /> Refresh
          </button>
        </div>
      </div>

      {error   && <div className="adm-alert adm-alert-error">{error}</div>}
      {success && <div className="adm-alert adm-alert-success">{success}</div>}

      {/* Summary stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>
        <TierCard icon={RiUserHeartLine}   label="Total Donors"            value={pagination.total}       tone="red"   tier="sub" />
        <TierCard icon={RiHeartPulseLine}  label="Medical Records Added"   value={donorsWithMedical}      tone="green" tier="sub" />
        <TierCard icon={RiAlarmWarningLine} label="Pending Medical Records" value={donorsPendingMedical}  tone="amber" tier="normal" />
      </div>

      {/* Record donation form */}
      {showDonationForm && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-title">Record a Donation</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowDonationForm(false)}>Cancel</button>
          </div>
          <div className="panel-body">
            <form onSubmit={handleRecordDonation}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-s)", marginBottom: 7 }}>Donor</label>
                  <select
                    name="donor_id"
                    value={donationForm.donor_id}
                    onChange={(e) => setDonationForm({ ...donationForm, donor_id: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", fontSize: 13.5, color: "var(--ink)", outline: "none" }}
                  >
                    <option value="">Select donor</option>
                    {donors.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name} ({d.blood_group})</option>
                    ))}
                  </select>
                </div>
                <Field label="Donation Date" type="date" name="donation_date" value={donationForm.donation_date} onChange={(e) => setDonationForm({ ...donationForm, donation_date: e.target.value })} required />
                <Field label="Camp Name (optional)" name="camp_name" value={donationForm.camp_name} onChange={(e) => setDonationForm({ ...donationForm, camp_name: e.target.value })} />
                <Field label="Notes (optional)" name="notes" value={donationForm.notes} onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={recordingDonation}>
                {recordingDonation && <span className="btn-spin" />}
                <RiHeartPulseLine size={16} /> Record Donation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Medical record form */}
      {selectedDonor && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Add / Update Medical Information</div>
              <div className="panel-sub">Selected donor: <strong>{selectedDonor.full_name}</strong></div>
            </div>
            <span className={`badge ${selectedDonor.medical_record ? "badge-blue" : "badge-green"}`}>
              {selectedDonor.medical_record ? "Updating" : "New Record"}
            </span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSaveMedicalRecord}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Select label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
                <Field label="Weight (kg)" type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} required />
                <Field label="Hemoglobin Level" type="number" step="any" name="hemoglobin_level" value={formData.hemoglobin_level} onChange={handleChange} required />
                <Field label="Last Donation Date" type="date" name="last_donation_date" value={formData.last_donation_date} onChange={handleChange} />
                <CheckBox label="Recent Illness"     name="has_recent_illness"   checked={formData.has_recent_illness}   onChange={handleChange} />
                <CheckBox label="Chronic Condition"  name="has_chronic_condition" checked={formData.has_chronic_condition} onChange={handleChange} />
                <CheckBox label="Currently Pregnant" name="is_pregnant"           checked={formData.is_pregnant}           onChange={handleChange} />
                <CheckBox label="On Medication"      name="is_on_medication"      checked={formData.is_on_medication}      onChange={handleChange} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <span className="btn-spin" />}
                  <RiHeartPulseLine size={16} /> Save Medical Information
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedDonor(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donors table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Registered Donors</div>
            <div className="panel-sub">Page {pagination.page} of {pagination.total_pages} — {pagination.total} total donors</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={async () => { try { await exportDonorsCSV(search); } catch { setError("Export failed."); } }}>
              <RiDownloadLine size={14} /> Export CSV
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowDonationForm((v) => !v)}>
              <RiHeartPulseLine size={14} /> Record Donation
            </button>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, padding: "7px 12px", background: dark ? "#1E293B" : "#fff", gap: 8 }}>
              <RiSearchLine size={15} style={{ color: "var(--ink-l)", flexShrink: 0 }} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search donors..."
                style={{ border: "none", outline: "none", fontSize: 13, color: "var(--ink)", background: "transparent", width: 160 }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading donors...</p></div>
        ) : donors.length > 0 ? (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Contact</th>
                    <th>Donations</th>
                    <th>Churn Risk</th>
                    <th>Medical Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor) => (
                    <tr key={donor.id}>
                      <td>
                        <div className="cell-person">
                          <div className="cell-avatar"><RiUserHeartLine size={14} style={{ color: "var(--cr)" }} /></div>
                          <div>
                            <div className="cell-name">{donor.full_name}</div>
                            <div className="cell-sub">{donor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{donor.phone_number || "Not available"}</td>
                      <td style={{ fontWeight: 700, color: "var(--ink)", textAlign: "center" }}>{donor.total_donations ?? 0}</td>
                      <td><ChurnBadge risk={donor.churn_risk} /></td>
                      <td>
                        <span className={`badge ${donor.medical_record ? "badge-green" : "badge-amber"}`}>
                          {donor.medical_record ? "Medical Added" : "Pending Medical"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => handleSelectDonor(donor)}>
                          {donor.medical_record ? "Update" : "Add Medical"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.total_pages > 1 && (
              <div className="pagination-row">
                <span className="page-info">
                  Showing {((pagination.page - 1) * 20) + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
                </span>
                <div className="page-btns">
                  <button className="page-btn" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <RiArrowLeftLine size={14} />
                  </button>
                  <button className="page-btn" disabled={pagination.page >= pagination.total_pages} onClick={() => setPage((p) => p + 1)}>
                    <RiArrowRightLine size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state"><p>No donors found.</p></div>
        )}
      </div>

      {/* Lapsed donors */}
      {showLapsed && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Lapsed Donors</div>
              <div className="panel-sub">{lapsedTotal} donor{lapsedTotal !== 1 ? "s" : ""} who haven't donated in 6+ months or have never donated.</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={loadLapsedDonors}>
              <RiRefreshLine size={14} /> Refresh
            </button>
          </div>

          {lapsedTotal > 0 && (
            <div style={{ margin: "0 24px 16px", borderRadius: 12, border: dark ? "1.5px solid rgba(217,119,6,.3)" : "1.5px solid #FDE68A", background: dark ? "rgba(217,119,6,.1)" : "#FFFBEB", padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: dark ? "#FCD34D" : "#92400E", marginBottom: 12 }}>
                Blast Notification to All {lapsedTotal} Lapsed Donors
              </p>
              <form onSubmit={handleBlastLapsed}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-s)", marginBottom: 6 }}>Title</label>
                    <input value={blastTitle} onChange={(e) => setBlastTitle(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-s)", marginBottom: 6 }}>Message</label>
                    <input value={blastMessage} onChange={(e) => setBlastMessage(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, outline: "none" }} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={blasting}>
                  {blasting && <span className="btn-spin" />}
                  <RiAlarmWarningLine size={14} /> Send Blast to {lapsedTotal} Donors
                </button>
              </form>
            </div>
          )}

          {lapsedLoading ? (
            <div className="empty-state"><p>Loading lapsed donors...</p></div>
          ) : lapsedDonors.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Blood Group</th>
                    <th>Last Donation</th>
                    <th>Days Lapsed</th>
                  </tr>
                </thead>
                <tbody>
                  {lapsedDonors.map((donor) => (
                    <tr key={donor.id}>
                      <td>
                        <div className="cell-name">{donor.full_name}</div>
                        <div className="cell-sub">{donor.email}</div>
                      </td>
                      <td><span className="badge badge-red">{donor.blood_group || "—"}</span></td>
                      <td>{donor.latest_donation_date || "Never donated"}</td>
                      <td>
                        {donor.days_lapsed != null ? (
                          <span className="badge badge-amber">{donor.days_lapsed}d ago</span>
                        ) : (
                          <span className="badge badge-red">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><p>No lapsed donors found.</p></div>
          )}
        </div>
      )}
    </>
  );
}

const _SPARK = [30, 50, 40, 70, 55, 80, 65];

function TierCard({ icon: Icon, label, value, tone = "red", tier = "sub" }) {
  const { dark } = useTheme();
  const accentMap  = { red: "var(--cr)", green: "var(--green)", blue: "var(--blue)", amber: "var(--amber)" };
  const accentXlLt = { red: "#FDEEF1", green: "#F0FDF4", blue: "#EFF6FF", amber: "#FFFBEB" };
  const accentXlDk = { red: "rgba(196,30,58,.18)", green: "rgba(22,163,74,.18)", blue: "rgba(37,99,235,.18)", amber: "rgba(217,119,6,.18)" };
  const accent   = accentMap[tone] || "var(--cr)";
  const accentXl = (dark ? accentXlDk : accentXlLt)[tone] || (dark ? "rgba(196,30,58,.18)" : "#FDEEF1");

  if (tier === "sub") {
    return (
      <div className="card-submain" style={{ "--accent": accent, "--accent-xl": accentXl }}>
        <div className="card-sub-icon"><Icon size={20} /></div>
        <div className="card-sub-val">{value ?? "—"}</div>
        <div className="card-sub-label">{label}</div>
        <div className="card-sub-sparkline">
          {_SPARK.map((h, i) => <div key={i} className="card-sub-bar" style={{ height: `${h}%` }} />)}
        </div>
      </div>
    );
  }
  return (
    <div className="card-normal" style={{ "--accent": accent, "--accent-xl": accentXl }}>
      <div className="card-norm-icon"><Icon size={18} /></div>
      <div className="card-norm-val">{value ?? "—"}</div>
      <div className="card-norm-label">{label}</div>
    </div>
  );
}

function ChurnBadge({ risk }) {
  const cls = { HIGH: "badge-red", MEDIUM: "badge-amber", LOW: "badge-green" }[risk] ?? "badge-gray";
  return <span className={`badge ${cls} dot`}>{risk ?? "—"}</span>;
}

function Field({ label, name, value, onChange, type = "text", required = false, step }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-s)", marginBottom: 7 }}>{label}</label>
      <input
        type={type} step={step} name={name} value={value} onChange={onChange} required={required}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", fontSize: 13.5, color: "var(--ink)", outline: "none", fontFamily: "inherit" }}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-s)", marginBottom: 7 }}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", fontSize: 13.5, color: "var(--ink)", outline: "none", fontFamily: "inherit" }}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function CheckBox({ label, name, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, border: "1.5px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 500, color: "var(--ink)", cursor: "pointer" }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ width: 16, height: 16, accentColor: "var(--cr)" }} />
      {label}
    </label>
  );
}

export default AdminDonors;
