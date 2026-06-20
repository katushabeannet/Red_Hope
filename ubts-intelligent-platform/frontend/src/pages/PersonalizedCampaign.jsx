import { useEffect, useMemo, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiFilter3Line,
  RiMapPinLine,
  RiRefreshLine,
  RiSearchEyeLine,
  RiTimeLine,
} from "react-icons/ri";

import {
  getCampaignCamps,
  scanPersonalizedCampaignDonors,
} from "../services/campaignService";
import { blastCampaignNotification } from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import AdminLoader from "../components/common/AdminLoader";

const initialFilters = {
  blood_group: "",
  camp_id: "",
  radius_km: 10,
};

const tabs = [
  { key: "matched_donors",       label: "All Matched",    icon: RiCheckboxCircleLine },
  { key: "available_donors",     label: "Available",      icon: RiCheckboxCircleLine },
  { key: "unavailable_donors",   label: "Unavailable",    icon: RiTimeLine },
  { key: "ineligible_donors",    label: "Ineligible",     icon: RiCloseCircleLine },
  { key: "outside_radius_donors",label: "Outside Radius", icon: RiMapPinLine },
  { key: "skipped_donors",       label: "Skipped",        icon: RiRefreshLine },
];

function PersonalizedCampaign() {
  const { showToast } = useToast();

  const [filters, setFilters] = useState(initialFilters);
  const [camps, setCamps] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("matched_donors");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campsLoading, setCampsLoading] = useState(false);

  const [blastTitle, setBlastTitle] = useState("UBTS Campaign — Blood Donation Alert");
  const [blastMessage, setBlastMessage] = useState("");
  const [blastTarget, setBlastTarget] = useState("available");
  const [blasting, setBlasting] = useState(false);
  const [campaignPerformanceId, setCampaignPerformanceId] = useState(null);

  useEffect(() => { loadCamps(); }, []);

  const loadCamps = async () => {
    try {
      setCampsLoading(true);
      const data = await getCampaignCamps();
      setCamps(Array.isArray(data) ? data : data.results || []);
    } catch {
      showToast({ type: "error", title: "Camps Failed", message: "Unable to load donation camps." });
    } finally {
      setCampsLoading(false);
    }
  };

  const selectedCamp = camps.find((camp) => String(camp.id) === String(filters.camp_id));

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setResult(null);
    setActiveTab("matched_donors");
    setSelectedDonor(null);
    setBlastMessage("");
    setCampaignPerformanceId(null);
  };

  const handleBlast = async (e) => {
    e.preventDefault();
    if (!blastMessage.trim()) {
      showToast({ type: "error", title: "Missing Message", message: "Please enter a blast message." });
      return;
    }
    const targetDonors = blastTarget === "available" ? availableDonors : result?.matched_donors || [];
    const donor_ids = targetDonors.map((d) => d.donor_id).filter(Boolean);
    if (!donor_ids.length) {
      showToast({ type: "error", title: "No Donors", message: "No donor IDs found in selected group." });
      return;
    }
    try {
      setBlasting(true);
      const data = await blastCampaignNotification({ donor_ids, title: blastTitle, message: blastMessage, campaign_performance_id: campaignPerformanceId });
      showToast({ type: "success", title: "Blast Sent", message: `Notifications sent to ${data.sent_count} of ${data.total_targeted} donors.` });
      setBlastMessage("");
    } catch (err) {
      showToast({ type: "error", title: "Blast Failed", message: err.response?.data?.error || "Failed to send campaign blast." });
    } finally {
      setBlasting(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        blood_group: filters.blood_group || null,
        campaign_latitude: selectedCamp?.latitude || null,
        campaign_longitude: selectedCamp?.longitude || null,
        radius_km: filters.radius_km || 10,
      };
      const data = await scanPersonalizedCampaignDonors(payload);
      setResult(data);
      setCampaignPerformanceId(data.campaign_performance_id || null);
      setActiveTab("matched_donors");
      showToast({ type: "success", title: "Campaign Scan Completed", message: `${data.total_matches} donor(s) fully matched your campaign filters.` });
    } catch (err) {
      showToast({ type: "error", title: "Campaign Scan Failed", message: err.response?.data?.error || "Unable to complete personalized campaign scan." });
    } finally {
      setLoading(false);
    }
  };

  const availableDonors = useMemo(() => result?.matched_donors?.filter((donor) => donor.is_available) || [], [result]);
  const unavailableDonors = useMemo(() => result?.matched_donors?.filter((donor) => !donor.is_available) || [], [result]);

  const counts = useMemo(() => {
    if (!result) return {};
    return {
      matched_donors: result.matched_donors?.length || 0,
      available_donors: availableDonors.length,
      unavailable_donors: unavailableDonors.length,
      ineligible_donors: result.ineligible_donors?.length || 0,
      outside_radius_donors: result.outside_radius_donors?.length || 0,
      skipped_donors: result.skipped_donors?.length || 0,
    };
  }, [result, availableDonors, unavailableDonors]);

  const activeRows = useMemo(() => {
    if (!result) return [];
    if (activeTab === "available_donors") return availableDonors;
    if (activeTab === "unavailable_donors") return unavailableDonors;
    return result?.[activeTab] || [];
  }, [result, activeTab, availableDonors, unavailableDonors]);

  const inputStyle = { width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Personalized Campaign Engine</div>
          <h1 className="page-title rh-display">Target Campaign-Ready Donors</h1>
          <p className="page-desc">Select a donation camp, blood group, and radius. The system scans donors and gives a clean summary, while detailed reasons are shown only when you open a donor profile.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={handleReset}><RiRefreshLine /> Reset</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon cr"><RiFilter3Line size={16} /></div>
            <div>
              <div className="panel-title">Campaign Filters</div>
              <div className="panel-sub">Choose a camp instead of manually entering latitude and longitude.</div>
            </div>
          </div>
        </div>
        <div className="panel-body">
          <form onSubmit={handleScan} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Required Blood Group</label>
              <select name="blood_group" value={filters.blood_group} onChange={handleChange} style={inputStyle}>
                <option value="">All Blood Groups</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Donation Camp</label>
              <select name="camp_id" value={filters.camp_id} onChange={handleChange} style={inputStyle}>
                <option value="">{campsLoading ? "Loading camps..." : "Select Campaign Camp"}</option>
                {camps.map((camp) => (
                  <option key={camp.id} value={camp.id}>{camp.name} - {camp.district || camp.venue}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Radius KM</label>
              <input type="number" name="radius_km" value={filters.radius_km} onChange={handleChange} placeholder="10" style={inputStyle} />
            </div>

            <div style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px" }}>Selected Camp Location</p>
              <p style={{ fontSize: 13, color: "var(--ink-s)", margin: 0 }}>
                {selectedCamp
                  ? `${selectedCamp.name}, ${selectedCamp.venue || ""} ${selectedCamp.district || ""}`
                  : "No camp selected. Location filter will not be applied."}
              </p>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="btn-spin" /> : <RiSearchEyeLine />} Run Personalized Scan
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset}>Clear Filters</button>
            </div>
          </form>
        </div>
      </div>

      {loading && <AdminLoader text="Scanning donors…" />}

      {result && !loading && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
            {[
              { label: "All Matched", key: "matched_donors", tone: "cr" },
              { label: "Available", key: "available_donors", tone: "gr" },
              { label: "Unavailable", key: "unavailable_donors", tone: "am" },
              { label: "Ineligible", key: "ineligible_donors", tone: "cr" },
              { label: "Outside Radius", key: "outside_radius_donors", tone: "bl" },
              { label: "Skipped", key: "skipped_donors", tone: "pu" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.tone}`}><RiCheckboxCircleLine size={16} /></div>
                <div className="stat-body">
                  <div className="stat-val">{counts[s.key] || 0}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title-row">
                <div className="panel-icon bl"><RiSearchEyeLine size={16} /></div>
                <div>
                  <div className="panel-title">Campaign Scan Summary</div>
                  <div className="panel-sub">Click View Details to see full eligibility, availability, and exclusion reasons.</div>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={activeTab === key ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  >
                    <Icon size={14} /> {label}
                    <span style={{ borderRadius: 999, padding: "1px 6px", fontSize: 11, background: activeTab === key ? "rgba(255,255,255,0.2)" : "var(--canvas)", marginLeft: 2 }}>
                      {counts[key] || 0}
                    </span>
                  </button>
                ))}
              </div>

              {activeRows.length > 0 ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Donor</th>
                        <th>Contact</th>
                        <th>Blood Group</th>
                        <th>Distance</th>
                        <th>Summary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRows.map((donor, index) => (
                        <tr key={`${donor.donor_id || donor.full_name}-${index}`}>
                          <td>
                            <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{donor.full_name}</p>
                            <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{donor.email || "No email"}</p>
                          </td>
                          <td style={{ color: "var(--ink-s)" }}>{donor.phone_number || "Not available"}</td>
                          <td>
                            {donor.blood_group
                              ? <span className="badge badge-red">{donor.blood_group}</span>
                              : "N/A"}
                          </td>
                          <td style={{ color: "var(--ink-s)" }}>
                            {donor.distance_km !== null && donor.distance_km !== undefined
                              ? `${donor.distance_km} km`
                              : "Not filtered"}
                          </td>
                          <td style={{ fontSize: 12, color: "var(--ink-s)" }}>
                            {getShortReason(donor, activeTab)}
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedDonor(donor)}>View Details</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><RiSearchEyeLine size={28} /><p>No records found in this section.</p></div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title-row">
                <div className="panel-icon gr"><RiCheckboxCircleLine size={16} /></div>
                <div>
                  <div className="panel-title">Send Campaign Notification Blast</div>
                  <div className="panel-sub">Send an in-app notification, email, and SMS to the selected donor group.</div>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <form onSubmit={handleBlast} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Target Group</label>
                    <select value={blastTarget} onChange={(e) => setBlastTarget(e.target.value)} style={inputStyle}>
                      <option value="available">Available donors only ({availableDonors.length})</option>
                      <option value="all">All matched donors ({result?.matched_donors?.length || 0})</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Notification Title</label>
                    <input value={blastTitle} onChange={(e) => setBlastTitle(e.target.value)} placeholder="UBTS Campaign — Blood Donation Alert" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Message</label>
                  <textarea
                    rows={3}
                    value={blastMessage}
                    onChange={(e) => setBlastMessage(e.target.value)}
                    placeholder="Dear donor, UBTS urgently needs your blood donation. Please visit your nearest camp..."
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary" disabled={blasting}>
                    {blasting ? <span className="btn-spin" /> : null} Send Blast Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {selectedDonor && (
        <DonorDetailsModal donor={selectedDonor} onClose={() => setSelectedDonor(null)} />
      )}
    </>
  );
}

function DonorDetailsModal({ donor, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "0 16px" }}>
      <div style={{ maxHeight: "90vh", width: "100%", maxWidth: 720, overflowY: "auto", borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface,#fff)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "20px 24px" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{donor.full_name}</h3>
            <p style={{ fontSize: 13, color: "var(--ink-s)", margin: "2px 0 0" }}>
              {donor.email || "No email"} • {donor.phone_number || "No phone"}
            </p>
          </div>
          <button onClick={onClose} style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-l)" }}>
            <RiCloseLine size={22} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <DetailBox label="Blood Group" value={donor.blood_group} />
            <DetailBox label="Distance" value={donor.distance_km !== null && donor.distance_km !== undefined ? `${donor.distance_km} km` : "Not filtered"} />
            <DetailBox label="Donations" value={donor.total_donations ?? "Not recorded"} />
          </div>

          <DetailSection
            title="Eligibility"
            status={donor.is_eligible ? "Eligible" : "Not Eligible"}
            summary={donor.eligibility_summary}
            reasons={donor.eligibility_reasons}
          />

          <DetailSection
            title="Availability"
            status={donor.is_available ? "Available" : "Not Available"}
            summary={donor.availability_summary}
            reasons={donor.availability_reasons}
          />

          {donor.exclusion_reason && (
            <div style={{ borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2", padding: 16, color: "#dc2626" }}>
              <p style={{ fontWeight: 600, margin: "0 0 8px" }}>Exclusion Reason</p>
              <p style={{ fontSize: 13, margin: 0 }}>{donor.exclusion_reason}</p>
            </div>
          )}

          {donor.reason && (
            <div style={{ borderRadius: 12, border: "1px solid #fde68a", background: "#fffbeb", padding: 16, color: "#92400e" }}>
              <p style={{ fontWeight: 600, margin: "0 0 8px" }}>Skipped Reason</p>
              <p style={{ fontSize: 13, margin: 0 }}>{donor.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, status, summary, reasons }) {
  const isPositive = !status.includes("Not");
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h4 style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{title}</h4>
        <span className={`badge ${isPositive ? "badge-green" : "badge-red"}`}>{status}</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-s)", margin: 0 }}>{summary || "No summary available."}</p>
      {reasons?.length > 0 && (
        <ul style={{ marginTop: 12, paddingLeft: 20, fontSize: 13, color: "var(--ink-s)" }}>
          {reasons.map((reason, index) => <li key={index}>{reason}</li>)}
        </ul>
      )}
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: 16 }}>
      <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{value || "N/A"}</p>
    </div>
  );
}

function getShortReason(donor, tab) {
  if (tab === "matched_donors") return "Eligible donor included in campaign ranking";
  if (tab === "available_donors") return "Available and ready for campaign targeting";
  if (tab === "unavailable_donors") return "Eligible but has low predicted availability";
  if (tab === "ineligible_donors") return "Failed eligibility rules";
  if (tab === "outside_radius_donors") return "Outside selected campaign radius";
  if (tab === "skipped_donors") return donor.reason || "Missing required data";
  return donor.match_status || "Reviewed";
}

export default PersonalizedCampaign;
