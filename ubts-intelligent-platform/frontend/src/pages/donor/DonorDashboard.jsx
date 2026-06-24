import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAwardLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiDownloadLine,
  RiFileImageLine,
  RiDropLine,
  RiHeartPulseLine,
  RiHistoryLine,
  RiInformationLine,
  RiMapPinLine,
  RiMedalLine,
  RiNotification3Line,
  RiShieldCheckLine,
  RiUserHeartLine,
} from "react-icons/ri";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  getDonorProfile,
  getDonorMedicalRecord,
  getDonorImpact,
  getDonorRetentionSummary,
  checkEligibility,
  checkAvailability,
  findNearestCamp,
  getDonorAssessmentHistory,
  getDonationHistory,
  downloadCertificate,
  getActiveCamps,
} from "../../services/donorService";

import redhopeLogo from "../../assets/logo/redhope.png";
import AdminLoader from "../../components/common/AdminLoader";
import NearestCampMap from "../../components/NearestCampMap";
import DonorLevelCard from "../../components/donor/DonorLevelCard";
import NextMilestoneCard from "../../components/donor/NextMilestoneCard";

const calLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

function DonorDashboard() {
  const { dark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [impact, setImpact] = useState(null);
  const [retention, setRetention] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [activeTool, setActiveTool] = useState(null); // "eligibility" | "history" | "donations" | "calendar" | "nearestCamp"
  const [certModal, setCertModal] = useState(null); // { donation, totalDonations }

  const [history, setHistory] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyVisible, setHistoryVisible] = useState(false);

  const [donations, setDonations] = useState(null);
  const [donationPage, setDonationPage] = useState(1);
  const [donationsVisible, setDonationsVisible] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(false);

  const [campCalendarVisible, setCampCalendarVisible] = useState(false);
  const [campEvents, setCampEvents] = useState([]);
  const [campsLoading, setCampsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadDonorData(); }, []);

  const loadDonorData = async () => {
    try {
      setError("");
      const profileData = await getDonorProfile();
      setProfile(profileData);
      try { setMedicalRecord(await getDonorMedicalRecord()); } catch (e) { if (e.response?.status !== 404) throw e; setMedicalRecord(null); }
      try { setImpact(await getDonorImpact()); } catch { setImpact(null); }
      try { setRetention(await getDonorRetentionSummary()); } catch { setRetention(null); }
    } catch { setError("Failed to load donor dashboard information."); }
  };

  const handleEligibilityCheck = async () => {
    try { setLoading(true); setError(""); const r = await checkEligibility(); setEligibilityResult(r); setActiveTool("eligibility"); }
    catch { setError("Eligibility check failed. UBTS may need to add your medical record first."); }
    finally { setLoading(false); }
  };

  const handleLoadHistory = async (page = 1) => {
    try { setHistoryLoading(true); const data = await getDonorAssessmentHistory({ page, page_size: 5 }); setHistory(data); setHistoryPage(page); setHistoryVisible(true); setActiveTool("history"); }
    catch { setError("Failed to load assessment history."); }
    finally { setHistoryLoading(false); }
  };

  const handleLoadDonations = async (page = 1) => {
    try { setDonationsLoading(true); const data = await getDonationHistory({ page, page_size: 5 }); setDonations(data); setDonationPage(page); setDonationsVisible(true); setActiveTool("donations"); }
    catch { setError("Failed to load donation history."); }
    finally { setDonationsLoading(false); }
  };


  const handleLoadCampCalendar = async () => {
    if (campCalendarVisible) { setCampCalendarVisible(false); setActiveTool(null); return; }
    try {
      setCampsLoading(true);
      const camps = await getActiveCamps();
      setCampEvents((camps || []).filter((c) => c.start_date && c.end_date).map((c) => ({
        id: c.id, title: c.name,
        start: new Date(c.start_date), end: new Date(c.end_date), resource: c,
      })));
      setCampCalendarVisible(true);
      setActiveTool("calendar");
    } catch { setError("Failed to load camp calendar."); }
    finally { setCampsLoading(false); }
  };

  const handleNearestCamp = async () => {
    if (!navigator.geolocation) { setError("Geolocation is not supported by this browser."); return; }
    setLocationLoading(true); setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try { setNearestCamp(await findNearestCamp({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })); setActiveTool("nearestCamp"); }
        catch { setError("Failed to find nearest donation camp."); }
        finally { setLocationLoading(false); }
      },
      () => { setError("Location access was denied."); setLocationLoading(false); }
    );
  };

  const eligibilityAssessment = eligibilityResult?.assessment;
  const camp = nearestCamp?.nearest_camp;

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Donor Portal</div>
          <h1 className="page-title rh-display">
            Welcome, {profile?.full_name?.split(" ")[0] || "Donor"}
          </h1>
          <p className="page-desc">
            Track your donation impact, check donor status, and locate nearby blood donation camps.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {profile?.blood_group && (
            <span className="badge badge-red" style={{ fontSize: 15, padding: "6px 18px", fontWeight: 800 }}>
              {profile.blood_group}
            </span>
          )}
          <span className="badge badge-amber" style={{ fontSize: 13, padding: "5px 14px" }}>
            {impact?.donor_level || "Bronze"} Donor
          </span>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="panel" style={{ background: dark ? "rgba(220,38,38,.1)" : "#FFF5F5", borderLeft: "4px solid var(--cr)", padding: "14px 20px" }}>
          <p style={{ fontSize: 13, color: "var(--cr)", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ── Medical record warning ── */}
      {!medicalRecord && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, var(--amber) 0%, #f59e0b 100%)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RiInformationLine size={24} style={{ color: "#fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.8)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Action Required</div>
              <h4 style={{ fontWeight: 800, color: "#fff", margin: 0, fontSize: 15 }}>Medical information not yet available</h4>
            </div>
            <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>Pending</span>
          </div>
          <div style={{ padding: "16px 24px", background: dark ? "rgba(217,119,6,.08)" : "#FFFBEB", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.7, margin: 0 }}>
                Your medical information will be recorded by UBTS staff after your first donation or medical screening.
                Eligibility checks and donation reminders will become active once this is on file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Retention reminder ── */}
      {retention && (
        <RetentionBanner
          retention={retention}
          onFindCamp={handleNearestCamp}
          locationLoading={locationLoading}
        />
      )}

      {/* ── Impact stat cards ── */}
      <div className="stat-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        <div className="card-main">
          <div className="card-shimmer" />
          <div className="card-main-icon"><RiUserHeartLine size={26} /></div>
          <div className="card-main-val">{impact?.total_donations ?? 0}</div>
          <div className="card-main-label">Total Donations</div>
          <div className="card-trend" />
        </div>
        <div className="card-submain" style={{ "--accent": "var(--amber)", "--accent-xl": dark ? "rgba(217,119,6,.18)" : "#FFFBEB" }}>
          <div className="card-sub-icon"><RiHeartPulseLine size={20} /></div>
          <div className="card-sub-val">{impact?.estimated_lives_saved ?? 0}</div>
          <div className="card-sub-label">Lives Saved</div>
          <div className="card-sub-sparkline">
            {[30,50,40,70,55,80,65].map((h, i) => (
              <div key={i} className={`card-sub-bar${i === 5 ? " peak" : ""}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <DonorLevelCard
          donorLevel={impact?.donor_level || "Bronze"}
          totalDonations={impact?.total_donations || 0}
        />
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <NextMilestoneCard
          totalDonations={impact?.total_donations || 0}
          nextMilestone={impact?.next_milestone}
          nextBadge={impact?.next_badge}
        />
        <div className="card-submain" style={{ "--accent": "var(--cr)", "--accent-xl": dark ? "rgba(196,30,58,.18)" : "#FDEEF1" }}>
          <div className="card-sub-icon"><RiUserHeartLine size={20} /></div>
          <div className="card-sub-val" style={{ fontSize: 18 }}>{medicalRecord ? "Ready" : "Awaiting"}</div>
          <div className="card-sub-label">Donor Status</div>
        </div>
        <div className="card-normal" style={{ "--accent": "var(--green)", "--accent-xl": dark ? "rgba(22,163,74,.18)" : "#F0FDF4" }}>
          <div className="card-norm-icon"><RiHeartPulseLine size={18} /></div>
          <div className="card-norm-val" style={{ fontSize: 20 }}>
            {medicalRecord?.hemoglobin_level ? `${medicalRecord.hemoglobin_level}` : "—"}
          </div>
          <div className="card-norm-label">Hemoglobin (g/dL)</div>
        </div>
      </div>

      {/* ── Achievement badges ── */}
      {impact?.badges?.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon am"><RiAwardLine size={16} /></div>
              <div>
                <div className="panel-title">Achievement Badges</div>
                <div className="panel-sub">Recognition earned from your donation journey.</div>
              </div>
            </div>
          </div>
          <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
            {impact.badges.map((badge, i) => (
              <div key={i} style={{ borderRadius: 14, border: "1px solid var(--border)", padding: "16px", background: dark ? "#1E293B" : "#FFFBEB", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: dark ? "rgba(217,119,6,.18)" : "#FEF3C7", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <RiAwardLine size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>{badge.badge_name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-s)", lineHeight: 1.5 }}>{badge.badge_description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Intelligence tools ── */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon bl"><RiShieldCheckLine size={16} /></div>
            <div>
              <div className="panel-title">Donor Intelligence Tools</div>
              <div className="panel-sub">
                Eligibility and availability checks require UBTS medical information. Camp recommendations can be used anytime.
              </div>
            </div>
          </div>
        </div>
        <div className="panel-body" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            className={`btn btn-sm ${activeTool === "eligibility" ? "btn-primary" : "btn-outline"}`}
            onClick={handleEligibilityCheck}
            disabled={!medicalRecord || loading}
          >
            {loading && activeTool === "eligibility" ? <span className="btn-spin" /> : <RiShieldCheckLine />} Check Eligibility
          </button>
          <button
            className={`btn btn-sm ${activeTool === "nearestCamp" ? "btn-primary" : "btn-outline"}`}
            onClick={handleNearestCamp}
            disabled={locationLoading}
          >
            <RiMapPinLine /> {locationLoading ? "Locating…" : "Find Nearest Camp"}
          </button>
          <button
            className={`btn btn-sm ${activeTool === "history" ? "btn-primary" : "btn-outline"}`}
            onClick={() => { if (activeTool === "history") { setActiveTool(null); setHistoryVisible(false); } else { handleLoadHistory(1); } }}
            disabled={historyLoading}
          >
            <RiHistoryLine /> Assessment History
          </button>
          <button
            className={`btn btn-sm ${activeTool === "donations" ? "btn-primary" : "btn-outline"}`}
            onClick={() => { if (activeTool === "donations") { setActiveTool(null); setDonationsVisible(false); } else { handleLoadDonations(1); } }}
            disabled={donationsLoading}
          >
            <RiDropLine /> My Donations
          </button>
          <button
            className={`btn btn-sm ${activeTool === "calendar" ? "btn-primary" : "btn-outline"}`}
            onClick={handleLoadCampCalendar}
            disabled={campsLoading}
          >
            <RiCalendarLine /> Camp Calendar
          </button>
        </div>
      </div>

      {/* ── Eligibility result ── */}
      {eligibilityResult && activeTool === "eligibility" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className={`panel-icon ${eligibilityAssessment?.is_eligible ? "gr" : "cr"}`}>
                <RiShieldCheckLine size={16} />
              </div>
              <div>
                <div className="panel-title">Eligibility Result</div>
                <div className="panel-sub">AI-assisted eligibility assessment based on your medical record.</div>
              </div>
            </div>
            <span className={`badge ${eligibilityAssessment?.is_eligible ? "badge-green" : "badge-red"}`}>
              {eligibilityAssessment?.is_eligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
          <div className="panel-body">
            <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.7, margin: 0 }}>
              {eligibilityResult.assistant_response}
            </p>
          </div>
        </div>
      )}

      {/* ── Assessment history ── */}
      {historyVisible && history && activeTool === "history" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiHistoryLine size={16} /></div>
              <div>
                <div className="panel-title">Assessment History</div>
                <div className="panel-sub">Your past eligibility and availability checks.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            {historyLoading ? (
              <AdminLoader text="Loading history…" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <h4 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14, marginBottom: 12 }}>
                    Eligibility ({history.eligibility_total} total)
                  </h4>
                  {history.eligibility_history?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {history.eligibility_history.map((item) => (
                        <div key={item.id} style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", background: dark ? "#0F172A" : "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--ink-l)" }}>
                              {new Date(item.assessed_at).toLocaleDateString()}
                            </span>
                            <span className={`badge ${item.is_eligible ? "badge-green" : "badge-red"}`}>
                              {item.is_eligible ? "Eligible" : "Not Eligible"}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--ink-s)", lineHeight: 1.5, margin: 0 }}>
                            {item.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--ink-l)" }}>No eligibility assessments yet.</p>
                  )}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14, marginBottom: 12 }}>
                    Availability ({history.availability_total} total)
                  </h4>
                  {history.availability_history?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {history.availability_history.map((item) => (
                        <div key={item.id} style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", background: dark ? "#0F172A" : "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--ink-l)" }}>
                              {new Date(item.assessed_at).toLocaleDateString()}
                            </span>
                            <span className={`badge ${item.is_available ? "badge-green" : "badge-amber"}`}>
                              {item.is_available ? "Available" : "Not Available"}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "var(--ink-s)", margin: 0 }}>
                            Probability: {Math.round((item.availability_probability || 0) * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--ink-l)" }}>No availability assessments yet.</p>
                  )}
                </div>
              </div>
            )}
            {!historyLoading && (history.eligibility_total_pages > 1 || history.availability_total_pages > 1) && (
              <div className="pagination-row">
                <span className="page-info">Page {historyPage}</span>
                <div className="page-btns">
                  <button className="page-btn" disabled={historyPage <= 1} onClick={() => handleLoadHistory(historyPage - 1)}>
                    <RiArrowLeftLine /> Prev
                  </button>
                  <button
                    className="page-btn"
                    disabled={historyPage >= Math.max(history.eligibility_total_pages, history.availability_total_pages)}
                    onClick={() => handleLoadHistory(historyPage + 1)}
                  >
                    Next <RiArrowRightLine />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── My donations ── */}
      {donationsVisible && activeTool === "donations" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiDropLine size={16} /></div>
              <div>
                <div className="panel-title">My Donations</div>
                <div className="panel-sub">Your recorded donation history with downloadable certificates.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            {donationsLoading ? (
              <AdminLoader text="Loading donations…" />
            ) : donations?.donations?.length > 0 ? (
              <>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Camp</th>
                        <th style={{ width: 140 }}>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.donations.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600, color: "var(--ink)" }}>
                            {new Date(d.donation_date).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </td>
                          <td style={{ color: "var(--ink-s)" }}>{d.camp_name || "Camp not specified"}</td>
                          <td>
                            {(impact?.total_donations || 0) >= 3 ? (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setCertModal({ donation: d, totalDonations: impact?.total_donations || 0 })}
                              >
                                <RiAwardLine /> View Certificate
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: "var(--ink-l)" }}>Need 3+ donations</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {donations.total_pages > 1 && (
                  <div className="pagination-row">
                    <span className="page-info">
                      Page {donationPage} of {donations.total_pages} ({donations.total} total)
                    </span>
                    <div className="page-btns">
                      <button className="page-btn" disabled={donationPage <= 1} onClick={() => handleLoadDonations(donationPage - 1)}>
                        <RiArrowLeftLine /> Prev
                      </button>
                      <button className="page-btn" disabled={donationPage >= donations.total_pages} onClick={() => handleLoadDonations(donationPage + 1)}>
                        Next <RiArrowRightLine />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <RiAwardLine size={32} />
                <p>No donations recorded yet</p>
                <span>Your donations will appear here after UBTS staff records them.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Camp calendar ── */}
      {campCalendarVisible && activeTool === "calendar" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon bl"><RiCalendarEventLine size={16} /></div>
              <div>
                <div className="panel-title">Upcoming Donation Camps</div>
                <div className="panel-sub">Active blood donation camps — click any event for details.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            {campsLoading ? <AdminLoader text="Loading camps…" /> : campEvents.length > 0 ? (
              <div style={{ height: 480, borderRadius: 12, overflow: "hidden" }}>
                <Calendar
                  localizer={calLocalizer}
                  events={campEvents}
                  startAccessor="start"
                  endAccessor="end"
                  views={["month", "agenda"]}
                  defaultView="month"
                  style={{ height: "100%" }}
                  components={{ toolbar: CalendarToolbar }}
                  onSelectEvent={(event) => {
                    const c = event.resource;
                    alert(`${c.name}\n${c.venue}, ${c.district}, ${c.region}\n${c.start_date} → ${c.end_date}\nContact: ${c.contact_phone || "N/A"}`);
                  }}
                  eventPropGetter={() => ({
                    style: { backgroundColor: "var(--cr)", borderRadius: 6, border: "none", fontSize: 12 },
                  })}
                />
              </div>
            ) : (
              <div className="empty-state">
                <RiCalendarLine size={32} />
                <p>No active donation camps found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Nearest camp ── */}
      {nearestCamp && activeTool === "nearestCamp" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiMapPinLine size={16} /></div>
              <div>
                <div className="panel-title">Nearest Donation Camp</div>
              </div>
            </div>
            <span className="badge badge-green">{nearestCamp.distance_km} km away</span>
          </div>
          <div className="panel-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Camp Name", value: camp?.name },
                { label: "Distance", value: `${nearestCamp.distance_km} km away` },
                { label: "Venue", value: camp?.venue },
                { label: "District", value: camp?.district },
                { label: "Region", value: camp?.region },
                { label: "Contact", value: camp?.contact_phone || "Not provided" },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px", background: dark ? "#0F172A" : "#fff" }}>
                  <div style={{ fontSize: 11, color: "var(--ink-l)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{value || "N/A"}</div>
                </div>
              ))}
            </div>
            <NearestCampMap camp={camp} />
          </div>
        </div>
      )}

      {/* ── Certificate modal ── */}
      {certModal && (
        <CertificateModal
          donation={certModal.donation}
          totalDonations={certModal.totalDonations}
          donorName={profile?.full_name || "Donor"}
          bloodGroup={profile?.blood_group || "N/A"}
          onClose={() => setCertModal(null)}
        />
      )}
    </>
  );
}

/* ── Calendar custom toolbar (fixes Back/Next buttons) ── */
function CalendarToolbar({ label, onNavigate, onView, view, views }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px 12px", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => onNavigate("PREV")}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--canvas)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ← Back
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--canvas)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--canvas)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Next →
        </button>
      </div>
      <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: view === v ? "var(--cr)" : "var(--canvas)", color: view === v ? "#fff" : "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Certificate tier helper ── */
const COUNT_WORDS = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
  "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen","Twenty"];
function toCountWord(n) { return n < COUNT_WORDS.length ? COUNT_WORDS[n] : n.toString(); }

/* ── Certificate modal ── */
function CertificateModal({ donation, totalDonations, donorName, bloodGroup, onClose }) {
  const donationDate = new Date(donation.donation_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const certNo = `RH-${new Date().getFullYear()}-${String(donation.id).padStart(4, "0")}`;
  const donorId = `RH-DNR-${String(donation.id).padStart(4, "0")}`;
  const countWord = toCountWord(totalDonations);

  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [dlFmt, setDlFmt] = useState(null); // "pdf" | "image"

  const handleDownload = async (fmt) => {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    setDlFmt(fmt);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      if (fmt === "pdf") {
        const { jsPDF } = await import("jspdf");
        const cssW = certRef.current.offsetWidth;
        const cssH = certRef.current.offsetHeight;
        const pdf = new jsPDF({ orientation: cssW > cssH ? "landscape" : "portrait", unit: "px", format: [cssW, cssH] });
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, cssW, cssH);
        pdf.save(`RedHope_Certificate_${donation.id}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `RedHope_Certificate_${donation.id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    } finally {
      setDownloading(false);
      setDlFmt(null);
    }
  };

  /* Corner CSS blobs — div ellipses are html2canvas-safe unlike SVG viewBox edge elements */
  const blobBase = { position: "absolute", borderRadius: "50%", pointerEvents: "none" };
  const TopRightBlob = () => (
    <>
      <div style={{ ...blobBase, top: 0, right: 0, width: 340, height: 260, background: "#8B0000", opacity: 0.92, transform: "translate(50%,-50%)" }} />
      <div style={{ ...blobBase, top: 0, right: 0, width: 420, height: 200, background: "#1B6CA8", opacity: 0.55, transform: "translate(50%,-50%)" }} />
      <div style={{ ...blobBase, top: 0, right: 0, width: 290, height: 170, background: "#C0162C", opacity: 0.70, transform: "translate(50%,-50%)" }} />
    </>
  );
  const BottomLeftBlob = () => (
    <>
      <div style={{ ...blobBase, bottom: 0, left: 0, width: 340, height: 260, background: "#8B0000", opacity: 0.92, transform: "translate(-50%,50%)" }} />
      <div style={{ ...blobBase, bottom: 0, left: 0, width: 420, height: 200, background: "#1B6CA8", opacity: 0.55, transform: "translate(-50%,50%)" }} />
      <div style={{ ...blobBase, bottom: 0, left: 0, width: 290, height: 170, background: "#C0162C", opacity: 0.70, transform: "translate(-50%,50%)" }} />
    </>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", padding: "16px" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 900, maxHeight: "96vh", overflowY: "auto", borderRadius: 6, background: "#fff", boxShadow: "0 32px 80px rgba(0,0,0,.45)" }}
      >
        {/* ── Certificate body (captured by html2canvas) ── */}
        <div ref={certRef} style={{ position: "relative", background: "#fff", padding: "44px 56px 36px", overflow: "hidden" }}>

          {/* Outer thin red border */}
          <div style={{ position: "absolute", inset: 10, border: "1.5px solid #C0162C", borderRadius: 3, pointerEvents: "none", zIndex: 1 }} />

          {/* Top-right corner decoration */}
          <TopRightBlob />

          {/* Bottom-left corner decoration */}
          <BottomLeftBlob />

          {/* ── Header row: logo left | title right ── */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 28 }}>

            {/* Logo block */}
            <div style={{ minWidth: 120, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={redhopeLogo} alt="Red Hope" style={{ width: 90, height: 90, objectFit: "contain" }} />
              <div style={{ marginTop: 6, textAlign: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#C0162C", fontFamily: "Poppins, sans-serif" }}>Red</span>
                <span style={{ color: "#C0162C", fontSize: 16 }}>♥</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#1B6CA8", fontFamily: "Poppins, sans-serif" }}>Hope</span>
              </div>
              <div style={{ fontSize: 8, color: "#64748b", textAlign: "center", marginTop: 2, fontStyle: "italic" }}>
                Every Drop Counts. Every Life Matters.
              </div>
            </div>

            {/* Title block */}
            <div style={{ flex: 1, textAlign: "center", paddingTop: 8 }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 52, fontWeight: 800, color: "#C0162C", lineHeight: 1, letterSpacing: 3 }}>
                CERTIFICATE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 0" }}>
                <div style={{ flex: 1, height: 1.5, background: "#1B6CA8" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B6CA8", letterSpacing: 4, whiteSpace: "nowrap", fontFamily: "Poppins, sans-serif" }}>OF APPRECIATION</span>
                <div style={{ flex: 1, height: 1.5, background: "#1B6CA8" }} />
              </div>
              <div style={{ fontSize: 18, color: "#C0162C", marginTop: 4, lineHeight: 1 }}>♥</div>
            </div>
          </div>

          {/* ── Certificate body text ── */}
          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>

            <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#4B5563", margin: "0 0 10px", fontStyle: "italic" }}>
              This is to proudly certify that
            </p>

            {/* Donor name in calligraphy */}
            <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: 46, color: "#7C2D12", lineHeight: 1.2, margin: "0 0 2px" }}>
              {donorName}
            </div>

            {/* Decorative divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "6px 0 16px" }}>
              <div style={{ flex: 1, maxWidth: 220, height: 1, background: "#1B6CA8" }} />
              <span style={{ color: "#C0162C", fontSize: 12 }}>✦</span>
              <div style={{ flex: 1, maxWidth: 220, height: 1, background: "#1B6CA8" }} />
            </div>

            <p style={{ fontFamily: "Georgia, serif", fontSize: 13.5, color: "#374151", margin: "0 0 6px" }}>
              has selflessly given the gift of life through
            </p>

            <p style={{ fontSize: 15, fontWeight: 700, color: "#C0162C", margin: "0 0 14px", fontFamily: "Poppins, sans-serif" }}>
              {countWord} ({totalDonations}) Successful Donation{totalDonations !== 1 ? "s" : ""}.
            </p>

            <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#374151", lineHeight: 1.8, margin: "0 auto 6px", maxWidth: 520 }}>
              Your generosity, compassion, and commitment<br />
              have made a real difference in the lives of others.
            </p>

            <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#374151", margin: "0 0 28px" }}>
              Thank you for being a true hero.
            </p>

            {/* ── Signature row ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 16px" }}>

              {/* Left signature */}
              <div style={{ textAlign: "center", minWidth: 150 }}>
                <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: 28, color: "#374151", height: 44, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  O. Yakub
                </div>
                <div style={{ height: 1.5, background: "#374151", margin: "4px 0 6px" }} />
                <div style={{ fontWeight: 700, fontSize: 11, color: "#374151", fontFamily: "Poppins, sans-serif" }}>Program Coordinator</div>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Poppins, sans-serif" }}>Red Hope</div>
              </div>

              {/* Center seal */}
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", border: "3px solid #C0162C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 5, borderRadius: "50%", border: "1.5px dashed #C0162C", opacity: 0.35 }} />
                  <span style={{ fontSize: 22, color: "#C0162C", lineHeight: 1 }}>♥</span>
                  <span style={{ fontSize: 6.5, fontWeight: 800, color: "#C0162C", letterSpacing: 0.5, textAlign: "center", lineHeight: 1.5, fontFamily: "Poppins, sans-serif" }}>
                    THANK YOU<br />FOR SAVING<br />LIVES
                  </span>
                </div>
              </div>

              {/* Right signature */}
              <div style={{ textAlign: "center", minWidth: 150 }}>
                <div style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: 28, color: "#374151", height: 44, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  A. Katushabe
                </div>
                <div style={{ height: 1.5, background: "#374151", margin: "4px 0 6px" }} />
                <div style={{ fontWeight: 700, fontSize: 11, color: "#374151", fontFamily: "Poppins, sans-serif" }}>Executive Director</div>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "Poppins, sans-serif" }}>Red Hope</div>
              </div>
            </div>

            {/* Certificate meta */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 9, color: "#94A3B8", borderTop: "1px solid #E2E8F0", paddingTop: 10, fontFamily: "Poppins, sans-serif" }}>
              <span>Certificate No: {certNo}</span>
              <span>Date Issued: {donationDate}</span>
              <span>Donor ID: {donorId}</span>
            </div>
          </div>
        </div>

        {/* ── Action buttons (outside certificate area) ── */}
        <div style={{ padding: "14px 40px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", borderTop: "1px solid #E2E8F0", background: "#F8FAFC" }}>
          <button
            className="btn btn-primary"
            disabled={downloading}
            onClick={() => handleDownload("pdf")}
          >
            <RiDownloadLine />
            {downloading && dlFmt === "pdf" ? "Generating PDF…" : "Download PDF"}
          </button>
          <button
            className="btn btn-outline"
            disabled={downloading}
            onClick={() => handleDownload("image")}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RiFileImageLine />
            {downloading && dlFmt === "image" ? "Saving Image…" : "Download as Image"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Retention / Next Donation Reminder card ── */
function RetentionBanner({ retention, onFindCamp, locationLoading }) {
  const { dark } = useTheme();
  const type = retention.reminder_type;

  /* ── not_yet_due: rich countdown card ── */
  if (type === "not_yet_due") {
    const daysSince  = retention.days_since_last_donation || 0;
    const daysLeft   = retention.days_remaining || 0;
    const progress   = Math.min(Math.round((daysSince / 90) * 100), 100);
    const availPct   = retention.availability_result?.availability_probability != null
      ? Math.round(retention.availability_result.availability_probability * 100)
      : null;

    const today        = new Date();
    const nextEligible = new Date(today);
    nextEligible.setDate(today.getDate() + daysLeft);
    const lastDonation = new Date(today);
    lastDonation.setDate(today.getDate() - daysSince);

    const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    return (
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid var(--border)", background: dark ? "#152030" : "#F8FAFF",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: dark ? "rgba(37,99,235,.18)" : "#EFF6FF", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RiCalendarLine size={19} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Donation Readiness
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                Next Donation Reminder
              </div>
            </div>
          </div>
          <span className="badge badge-gray">Not Yet Due</span>
        </div>

        {/* Body: countdown + info */}
        <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "148px 1fr", gap: 24, alignItems: "center" }}>
          {/* Circular countdown */}
          <div style={{
            width: 148, height: 148, borderRadius: "50%", flexShrink: 0,
            background: dark ? "linear-gradient(135deg,rgba(37,99,235,.15) 0%,rgba(37,99,235,.22) 100%)" : "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
            border: "4px solid var(--blue)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(37,99,235,.12)",
          }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "var(--blue)", lineHeight: 1 }}>
              {daysLeft}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-s)", marginTop: 4, textAlign: "center" }}>
              days<br />remaining
            </div>
          </div>

          {/* Info chips grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoChip icon={RiCalendarEventLine} label="Days Since Last Donation" value={`${daysSince} days`} />
            <InfoChip icon={RiCalendarLine}      label="Next Eligible Date"         value={fmtDate(nextEligible)} accent="var(--blue)" />
            <InfoChip icon={RiHistoryLine}        label="Last Donation (approx.)"   value={daysSince ? fmtDate(lastDonation) : "No record"} />
            {availPct !== null && (
              <InfoChip icon={RiHeartPulseLine}   label="Availability Probability"  value={`${availPct}%`} accent={availPct >= 60 ? "var(--green)" : "var(--amber)"} />
            )}
          </div>
        </div>

        {/* Cooldown progress footer */}
        <div style={{ padding: "0 24px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-s)" }}>
              Cooldown progress — {progress}% complete
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-l)" }}>90-day minimum interval</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, var(--blue), #60a5fa)",
              width: `${progress}%`, transition: "width .7s ease",
            }} />
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-s)", margin: "10px 0 0", lineHeight: 1.6 }}>
            {retention.message}
          </p>
        </div>
      </div>
    );
  }

  /* ── ready_to_donate: green success card ── */
  if (type === "ready_to_donate") {
    const availPct = retention.availability_result?.availability_probability != null
      ? Math.round(retention.availability_result.availability_probability * 100)
      : null;
    return (
      <div className="panel" style={{ background: dark ? "rgba(22,163,74,.08)" : "#F0FDF4", borderLeft: "4px solid var(--green)", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: dark ? "rgba(22,163,74,.18)" : "#DCFCE7", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <RiCheckboxCircleLine size={28} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  Donation Readiness
                </div>
                <h3 style={{ fontWeight: 800, color: "var(--ink)", fontSize: 16, margin: "0 0 8px" }}>
                  {retention.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.6, margin: "0 0 14px" }}>
                  {retention.message}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {retention.days_since_last_donation !== null && (
                    <span style={{ background: "rgba(255,255,255,.8)", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-s)" }}>
                      {retention.days_since_last_donation} days since last donation
                    </span>
                  )}
                  {availPct !== null && (
                    <span style={{ background: "rgba(255,255,255,.8)", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
                      {availPct}% availability
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onFindCamp} disabled={locationLoading}>
              <RiMapPinLine /> {locationLoading ? "Finding…" : "Find Nearby Camp"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── first_recorded_donation: blue info card ── */
  if (type === "first_recorded_donation") {
    return (
      <div className="panel" style={{ background: dark ? "rgba(37,99,235,.08)" : "#EFF6FF", borderLeft: "4px solid var(--blue)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(37,99,235,.18)" : "#DBEAFE", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RiNotification3Line size={22} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
              Donation Readiness
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15, margin: "0 0 6px" }}>
              {retention.title}
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.6, margin: 0 }}>
              {retention.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── fallback (missing_medical_record handled above in page) ── */
  return null;
}

/* ── Info chip used inside countdown card ── */
function InfoChip({ icon: Icon, label, value, accent = "var(--ink)" }) {
  const { dark } = useTheme();
  return (
    <div style={{
      borderRadius: 12, border: "1.5px solid var(--border)",
      background: dark ? "#0F172A" : "#fff", padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <Icon size={13} style={{ color: "var(--ink-l)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "var(--ink-l)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent, lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}

export default DonorDashboard;
