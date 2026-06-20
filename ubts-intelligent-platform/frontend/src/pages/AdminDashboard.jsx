import { useEffect, useState } from "react";
import {
  RiBarChartLine,
  RiCalendarCheckLine,
  RiDashboardLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiMapPinLine,
  RiRefreshLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboardSummary,
  getRecentAssessments,
  getCampStatistics,
  getCampaignReadyDonors,
  getAdminAnalytics,
  getBloodDemandForecast,
} from "../services/adminService";
import { getCampaignPerformanceAnalytics } from "../services/campaignService";
import AdminLoader from "../components/common/AdminLoader";

const PIE_COLORS = ["#b91c1c","#ef4444","#fca5a5","#fecaca","#fee2e2","#dc2626","#991b1b","#7f1d1d"];

const DEMAND_BADGE = {
  HIGH:    { cls: "badge-red",   card: "demand-high" },
  MEDIUM:  { cls: "badge-amber", card: "demand-med"  },
  LOW:     { cls: "badge-green", card: "demand-low"  },
  UNKNOWN: { cls: "badge-gray",  card: ""            },
};

function AdminDashboard() {
  const [summary, setSummary]                   = useState(null);
  const [recentAssessments, setRecentAssessments] = useState(null);
  const [campStats, setCampStats]               = useState(null);
  const [readyDonors, setReadyDonors]           = useState(null);
  const [analytics, setAnalytics]               = useState(null);
  const [demandForecast, setDemandForecast]     = useState(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [scanLoading, setScanLoading]           = useState(false);
  const [error, setError]                       = useState("");

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    try {
      setError("");
      setLoading(true);
      const [summaryData, assessmentsData, campData, campaignAnalyticsData, analyticsData, demandData] =
        await Promise.all([
          getDashboardSummary(),
          getRecentAssessments(),
          getCampStatistics(),
          getCampaignPerformanceAnalytics(),
          getAdminAnalytics(),
          getBloodDemandForecast().catch(() => null),
        ]);
      setSummary(summaryData);
      setRecentAssessments(assessmentsData);
      setCampStats(campData);
      setCampaignAnalytics(campaignAnalyticsData);
      setAnalytics(analyticsData);
      setDemandForecast(demandData);
    } catch {
      setError("Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignReadyScan = async () => {
    try {
      setError("");
      setScanLoading(true);
      const data = await getCampaignReadyDonors();
      setReadyDonors(data);
    } catch {
      setError("Failed to scan campaign-ready donors.");
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) return <AdminLoader text="Loading admin intelligence dashboard..." />;

  return (
    <>
      {/* Page header */}
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Admin Intelligence</div>
          <h1 className="page-title rh-display">Dashboard Overview</h1>
          <p className="page-desc">Monitor donor records, assessment activity, donation camps, and campaign-ready donor intelligence.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={loadAdminData}>
            <RiRefreshLine size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="adm-alert adm-alert-error">{error}</div>}

      {/* Summary stat cards */}
      {summary && (
        <div className="stat-grid">
          <MetricCard icon={RiGroupLine}         label="Total Donors"            value={summary.total_donors}           tone="red" />
          <MetricCard icon={RiHeartPulseLine}    label="Medical Records"         value={summary.total_medical_records}  tone="emerald" />
          <MetricCard icon={RiMapPinLine}        label="Active Camps"            value={summary.active_camps}           tone="blue" />
          <MetricCard icon={RiCalendarCheckLine} label="Total Camps"             value={summary.total_camps}            tone="amber" />
          <MetricCard icon={RiShieldCheckLine}   label="Eligible Assessments"    value={summary.eligible_assessments}   tone="emerald" />
          <MetricCard icon={RiDashboardLine}     label="Available Assessments"   value={summary.available_assessments}  tone="blue" />
        </div>
      )}

      {/* Analytics charts */}
      {analytics && <AnalyticsCharts analytics={analytics} />}

      {/* Blood demand forecast */}
      {demandForecast && <BloodDemandForecast data={demandForecast} />}

      {/* Campaign performance analytics */}
      {campaignAnalytics && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div>
                <div className="panel-title">Campaign Performance Analytics</div>
                <div className="panel-sub">Historical performance summary of personalized donor campaign scans.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div className="stat-grid" style={{ marginBottom: 20 }}>
              <MetricCard icon={RiDashboardLine}  label="Campaign Scans"    value={campaignAnalytics.total_campaign_scans}      tone="red" />
              <MetricCard icon={RiGroupLine}       label="Targeted Donors"  value={campaignAnalytics.total_targeted_donors}     tone="blue" />
              <MetricCard icon={RiHeartPulseLine} label="Available Donors"  value={campaignAnalytics.total_available_donors}    tone="emerald" />
              <MetricCard icon={RiShieldCheckLine} label="High Priority"    value={campaignAnalytics.total_high_priority_donors} tone="amber" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <StatusBox label="Average Availability"   value={`${Math.round((campaignAnalytics.average_availability_score || 0) * 100)}%`}        variant="active" />
              <StatusBox label="Average Priority Score" value={`${Math.round((campaignAnalytics.average_campaign_priority_score || 0) * 100)}%`}   variant="completed" />
            </div>

            {campaignAnalytics.blood_group_summary?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>Blood Group Campaign Summary</h4>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Blood Group</th>
                        <th>Campaigns</th>
                        <th>Matched</th>
                        <th>Available</th>
                        <th>Unavailable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignAnalytics.blood_group_summary.map((group) => (
                        <tr key={group.blood_group}>
                          <td><span className="badge badge-red">{group.blood_group}</span></td>
                          <td>{group.campaigns}</td>
                          <td>{group.matched}</td>
                          <td>{group.available}</td>
                          <td>{group.unavailable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {campaignAnalytics.recent_campaigns?.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>Recent Campaign Scans</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {campaignAnalytics.recent_campaigns.map((campaign) => (
                    <div key={campaign.id} style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--ink)" }}>Blood Group: {campaign.blood_group}</p>
                          <p style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 4 }}>
                            Radius: {campaign.radius_km} km · Matched: {campaign.total_matches} · Available: {campaign.available_donors}
                          </p>
                        </div>
                        <span className="badge badge-green">
                          {Math.round((campaign.average_availability_score || 0) * 100)}% Avg Availability
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Camp statistics */}
      {campStats && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div>
                <div className="panel-title">Camp Statistics</div>
                <div className="panel-sub">Summary of donation camp statuses.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              <StatusBox label="Active"    value={campStats.active_camps}    variant="active" />
              <StatusBox label="Inactive"  value={campStats.inactive_camps}  variant="inactive" />
              <StatusBox label="Completed" value={campStats.completed_camps} variant="completed" />
            </div>
          </div>
        </div>
      )}

      {/* Campaign-ready donor scan */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Campaign-Ready Donor Scan</div>
            <div className="panel-sub">Find donors who are both eligible and likely available for a blood donation campaign.</div>
          </div>
          <button className="btn btn-primary" onClick={handleCampaignReadyScan} disabled={scanLoading}>
            {scanLoading && <span className="btn-spin" />}
            <RiShieldCheckLine size={16} />
            Run Intelligent Scan
          </button>
        </div>
        {readyDonors && (
          <div className="panel-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Total Ready Donors: {readyDonors.total_ready_donors}</p>
              <span className="badge badge-green">Verified scan</span>
            </div>
            {readyDonors.ready_donors.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyDonors.ready_donors.map((donor) => (
                      <tr key={donor.donor_id}>
                        <td style={{ fontWeight: 600, color: "var(--ink)" }}>{donor.full_name}</td>
                        <td>{donor.email}</td>
                        <td>{donor.phone_number}</td>
                        <td><span className="badge badge-red">{donor.blood_group}</span></td>
                        <td>{donor.availability_probability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><p>No campaign-ready donors found yet.</p></div>
            )}
          </div>
        )}
      </div>

      {/* Recent assessments */}
      {recentAssessments && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <AssessmentList title="Recent Eligibility Assessments"  items={recentAssessments.recent_eligibility}   type="eligibility" />
          <AssessmentList title="Recent Availability Assessments" items={recentAssessments.recent_availability}  type="availability" />
        </div>
      )}
    </>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const iconMap = { red: "cr", emerald: "gr", blue: "bl", amber: "am" };
  const iconCls = iconMap[tone] || "cr";
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconCls}`}><Icon size={22} /></div>
      <div className="stat-body">
        <div className="stat-val">{value ?? "—"}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StatusBox({ label, value, variant }) {
  const cls = { active: "badge-green", inactive: "badge-gray", completed: "badge-blue" }[variant] || "badge-gray";
  return (
    <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "var(--ink-s)" }}>{label}</span>
        <span className={`badge ${cls}`}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function AssessmentList({ title, items, type }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title-row">
          <div className="panel-title">{title}</div>
        </div>
      </div>
      <div className="panel-body">
        {items?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item, index) => {
              const isPositive = type === "eligibility" ? item.is_eligible : item.is_available;
              return (
                <div key={index} style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{item.donor || "Unknown donor"}</p>
                      <p style={{ fontSize: 11, color: "var(--ink-l)" }}>{item.email}</p>
                    </div>
                    <span className={`badge ${isPositive ? "badge-green" : "badge-red"}`}>
                      {isPositive ? "Positive" : "Negative"}
                    </span>
                  </div>
                  {type === "availability" && (
                    <p style={{ fontSize: 12, color: "var(--ink-s)" }}>Probability: {item.availability_probability}</p>
                  )}
                  <p style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 8, lineHeight: 1.5 }}>{item.summary}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><p>No records found.</p></div>
        )}
      </div>
    </div>
  );
}

function AnalyticsCharts({ analytics }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title-row">
          <div className="panel-icon"><RiBarChartLine size={20} /></div>
          <div>
            <div className="panel-title">Platform Analytics</div>
            <div className="panel-sub">Live charts — donations, blood groups, eligibility, top camps</div>
          </div>
        </div>
      </div>
      <div className="panel-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 32 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Donations per Month (last 6 months)</p>
            {analytics.donations_by_month?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.donations_by_month} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ink-l)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ink-l)" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
                  <Bar dataKey="donations" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", borderRadius: 12, color: "var(--ink-l)", fontSize: 13 }}>No donation records yet</div>
            )}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Blood Group Distribution</p>
            {analytics.blood_group_distribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={analytics.blood_group_distribution} dataKey="count" nameKey="blood_group" cx="50%" cy="50%" outerRadius={80} label={({ blood_group, percent }) => `${blood_group} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {analytics.blood_group_distribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Legend formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", borderRadius: 12, color: "var(--ink-l)", fontSize: 13 }}>No donors with blood group data</div>
            )}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Eligibility Assessment Breakdown</p>
            {(analytics.eligibility_breakdown?.[0]?.value + analytics.eligibility_breakdown?.[1]?.value) > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.eligibility_breakdown} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--ink-l)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ink-l)" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    <Cell fill="#16a34a" />
                    <Cell fill="#dc2626" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", borderRadius: 12, color: "var(--ink-l)", fontSize: 13 }}>No eligibility assessments yet</div>
            )}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Top Donation Camps</p>
            {analytics.top_camps?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.top_camps} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-l)" }} allowDecimals={false} />
                  <YAxis dataKey="camp" type="category" tick={{ fontSize: 10, fill: "var(--ink-l)" }} width={110} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="donations" fill="#b91c1c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", borderRadius: 12, color: "var(--ink-l)", fontSize: 13 }}>No donation camp records yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BloodDemandForecast({ data }) {
  if (!data?.forecast?.length) return null;
  const high = data.forecast.filter((f) => f.demand_level === "HIGH");
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title-row">
          <div>
            <div className="panel-title">Blood Demand Forecast</div>
            <div className="panel-sub">
              Rule-based supply/demand signal for next 7 days — as of {data.forecast_date}.
              {high.length > 0 && (
                <span style={{ color: "var(--cr)", fontWeight: 600 }}>
                  {" "}{high.map((f) => f.blood_group).join(", ")} in HIGH demand.
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="badge badge-red">AI Forecast</span>
      </div>
      <div className="demand-grid">
        {data.forecast.map((item) => {
          const cfg = DEMAND_BADGE[item.demand_level] || DEMAND_BADGE.UNKNOWN;
          return (
            <div key={item.blood_group} className={`demand-card ${cfg.card}`}>
              <div className="demand-card-head">
                <span className="demand-card-bg">{item.blood_group}</span>
                <span className={`badge ${cfg.cls} dot`}>{item.demand_level}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink-s)", lineHeight: 1.6 }}>{item.reason}</p>
              <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 11, color: "var(--ink-l)" }}>
                <span>{item.recent_donations} donations/30d</span>
                <span>·</span>
                <span>{item.eligible_donors} eligible</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
