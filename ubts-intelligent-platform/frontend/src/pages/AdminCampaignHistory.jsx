import { useEffect, useState } from "react";
import {
  RiBarChart2Line,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDownloadLine,
  RiEdit2Line,
  RiRefreshLine,
  RiSearchLine,
  RiUserLine,
} from "react-icons/ri";

import {
  getCampaignScanHistory,
  exportCampaignHistoryCSV,
  markCampaignConverted,
  getCampaignResponses,
  updateCampaignResponse,
  bulkUpdateCampaignResponses,
  exportCampaignResponsesCSV,
} from "../services/campaignService";
import { useToast } from "../context/ToastContext";
import AdminLoader from "../components/common/AdminLoader";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RESPONSE_BADGE = {
  CONTACTED:      "badge-blue",
  RESPONDED:      "badge-amber",
  DONATED:        "badge-green",
  NOT_INTERESTED: "badge-gray",
};
const RESPONSE_LABEL = {
  CONTACTED: "Contacted", RESPONDED: "Responded", DONATED: "Donated", NOT_INTERESTED: "Not Interested",
};

function ResponseBadge({ status }) {
  return (
    <span className={`badge ${RESPONSE_BADGE[status] ?? "badge-gray"}`}>
      {RESPONSE_LABEL[status] ?? status}
    </span>
  );
}

function AdminCampaignHistory() {
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => { loadHistory(); }, [page, bloodGroup]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getCampaignScanHistory({ page, page_size: 20, search, blood_group: bloodGroup });
      setRecords(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load campaign history." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadHistory(); };

  const handleExport = () => {
    exportCampaignHistoryCSV(bloodGroup);
    showToast({ type: "info", title: "Exporting", message: "CSV download started." });
  };

  const conversionRate = (r) =>
    r.contacted_donors ? `${Math.round((r.converted_donors / r.contacted_donors) * 100)}%` : "—";

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Campaign Analytics</div>
          <h1 className="page-title rh-display">Campaign Scan History</h1>
          <p className="page-desc">Full history of personalized donor campaign scans with contact, conversion, and response tracking.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={loadHistory}><RiRefreshLine /> Refresh</button>
          <button className="btn btn-outline btn-sm" onClick={handleExport}><RiDownloadLine /> Export CSV</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body">
          <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Search</label>
              <div style={{ position: "relative" }}>
                <RiSearchLine size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-l)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Campaign name, blood group, created by…"
                  style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => { setBloodGroup(e.target.value); setPage(1); }}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", fontSize: 13, outline: "none" }}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg || "All Blood Groups"}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" type="submit"><RiSearchLine /> Search</button>
          </form>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-s)", margin: "4px 0" }}>
        <span>{total} scan{total !== 1 ? "s" : ""} recorded</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      <div className="panel">
        <div className="panel-body">
          {loading ? (
            <AdminLoader text="Loading campaign history…" />
          ) : records.length === 0 ? (
            <div className="empty-state"><RiBarChart2Line size={32} /><p>No campaign scan records found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Blood Group</th>
                    <th>Matched</th>
                    <th>Available</th>
                    <th>Contacted</th>
                    <th>Converted</th>
                    <th>Conv. Rate</th>
                    <th>Avg Avail.</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{r.campaign_name || `Scan #${r.id}`}</p>
                        <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{r.radius_km} km radius</p>
                      </td>
                      <td><span className="badge badge-red">{r.blood_group || "All"}</span></td>
                      <td style={{ fontWeight: 600 }}>{r.total_matches}</td>
                      <td style={{ color: "var(--green, #16a34a)" }}>{r.available_donors}</td>
                      <td style={{ color: "var(--blue, #2563eb)" }}>{r.contacted_donors}</td>
                      <td style={{ color: "var(--purple, #7c3aed)" }}>{r.converted_donors}</td>
                      <td style={{ fontWeight: 600 }}>{conversionRate(r)}</td>
                      <td style={{ color: "var(--ink-s)" }}>{Math.round((r.average_availability_score || 0) * 100)}%</td>
                      <td style={{ fontSize: 12, color: "var(--ink-l)" }}>
                        {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedRecord(r)}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-row">
              <span className="page-info">{page} / {totalPages}</span>
              <div className="page-btns">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedRecord && (
        <CampaignDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onRecordUpdate={(id, updates) => {
            setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
            setSelectedRecord((prev) => prev && prev.id === id ? { ...prev, ...updates } : prev);
          }}
        />
      )}
    </>
  );
}

function CampaignDetailModal({ record, onClose, onRecordUpdate }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const [editingConverted, setEditingConverted] = useState(false);
  const [convertedInput, setConvertedInput] = useState(record.converted_donors ?? 0);
  const [savingConverted, setSavingConverted] = useState(false);

  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseFilter, setResponseFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "responses") loadResponses();
  }, [activeTab, responseFilter]);

  const loadResponses = async () => {
    try {
      setResponsesLoading(true);
      const data = await getCampaignResponses(record.id, { status: responseFilter });
      setResponses(data.responses || []);
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load responses." });
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleStatusChange = async (responseId, newStatus) => {
    try {
      const updated = await updateCampaignResponse(responseId, { status: newStatus });
      setResponses((prev) => prev.map((r) => (r.id === responseId ? { ...r, status: updated.status } : r)));
      if (newStatus === "DONATED") {
        const donated = responses.filter((r) => r.id === responseId ? true : r.status === "DONATED").length;
        onRecordUpdate(record.id, { converted_donors: donated });
      }
    } catch {
      showToast({ type: "error", title: "Update Failed", message: "Could not update response status." });
    }
  };

  const handleBulkUpdate = async () => {
    if (!selected.length || !bulkStatus) return;
    try {
      setBulkSaving(true);
      const data = await bulkUpdateCampaignResponses(record.id, { response_ids: selected, status: bulkStatus });
      showToast({ type: "success", title: "Updated", message: data.message });
      setSelected([]);
      setBulkStatus("");
      loadResponses();
    } catch {
      showToast({ type: "error", title: "Bulk Failed", message: "Could not bulk-update responses." });
    } finally {
      setBulkSaving(false);
    }
  };

  const handleSaveConverted = async () => {
    try {
      setSavingConverted(true);
      await markCampaignConverted(record.id, Number(convertedInput));
      onRecordUpdate(record.id, { converted_donors: Number(convertedInput) });
      setEditingConverted(false);
      showToast({ type: "success", title: "Saved", message: "Conversion count updated." });
    } catch {
      showToast({ type: "error", title: "Save Failed", message: "Could not update conversion count." });
    } finally {
      setSavingConverted(false);
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "responses", label: `Responses${responses.length ? ` (${responses.length})` : ""}` },
  ];

  const overviewRows = [
    { label: "Total Matched", value: record.total_matches },
    { label: "Available", value: record.available_donors, color: "#16a34a" },
    { label: "Unavailable", value: record.unavailable_donors, color: "#d97706" },
    { label: "High Priority", value: record.high_priority_donors, color: "var(--cr)" },
    { label: "Medium Priority", value: record.medium_priority_donors, color: "#d97706" },
    { label: "Low Priority", value: record.low_priority_donors, color: "var(--ink-l)" },
    { label: "Ineligible", value: record.ineligible_donors, color: "var(--cr)" },
    { label: "Outside Radius", value: record.outside_radius_donors, color: "var(--ink-l)" },
    { label: "Skipped", value: record.skipped_donors, color: "var(--ink-l)" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "0 16px" }}>
      <div style={{ maxHeight: "92vh", width: "100%", maxWidth: 720, overflowY: "auto", borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface,#fff)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--cr-xl,#ffe4e8)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cr)" }}>
              <RiBarChart2Line size={20} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                {record.campaign_name || `Campaign Scan #${record.id}`}
              </h3>
              <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>
                {new Date(record.created_at).toLocaleString("en-GB")} — by {record.created_by || "Admin"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-l)" }}>
            <RiCloseLine size={22} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", padding: "12px 24px 0" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "none", background: "transparent", cursor: "pointer",
                borderBottom: activeTab === t.key ? "2px solid var(--cr)" : "2px solid transparent",
                color: activeTab === t.key ? "var(--cr)" : "var(--ink-s)", marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {activeTab === "overview" && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { label: `Blood Group: ${record.blood_group || "All"}` },
                  { label: `Radius: ${record.radius_km} km` },
                  { label: `Contacted: ${record.contacted_donors}`, bg: "#eff6ff", color: "#1d4ed8" },
                  { label: `Converted: ${record.converted_donors}`, bg: "#f5f3ff", color: "#5b21b6" },
                ].map((p) => (
                  <span key={p.label} style={{ borderRadius: 999, border: "1px solid var(--border)", padding: "4px 12px", fontSize: 12, fontWeight: 600, background: p.bg || "transparent", color: p.color || "var(--ink-s)" }}>
                    {p.label}
                  </span>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Avg Availability Score", value: `${Math.round((record.average_availability_score || 0) * 100)}%` },
                  { label: "Avg Priority Score", value: `${Math.round((record.average_campaign_priority_score || 0) * 100)}%` },
                ].map((s) => (
                  <div key={s.label} style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: 16 }}>
                    <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{s.label}</p>
                    <p style={{ marginTop: 4, fontSize: 24, fontWeight: 700, color: "var(--ink)", margin: "4px 0 0" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    {overviewRows.map(({ label, value, color }) => (
                      <tr key={label} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 14px", color: "var(--ink-s)" }}>{label}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: color || "var(--ink)" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>Manual Conversion Override</p>
                    <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "2px 0 0" }}>Override converted count if not using response tracking.</p>
                  </div>
                  {!editingConverted && (
                    <button onClick={() => setEditingConverted(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--cr)", background: "none", border: "none", cursor: "pointer" }}>
                      <RiEdit2Line size={13} /> Edit
                    </button>
                  )}
                </div>
                {editingConverted ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="number" min={0} value={convertedInput}
                      onChange={(e) => setConvertedInput(e.target.value)}
                      style={{ width: 80, borderRadius: 10, border: "1px solid var(--border)", padding: "8px 10px", fontSize: 14, outline: "none" }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSaveConverted} disabled={savingConverted}>
                      {savingConverted ? <span className="btn-spin" /> : <RiCheckboxCircleLine />} Save
                    </button>
                    <button onClick={() => { setEditingConverted(false); setConvertedInput(record.converted_donors ?? 0); }}
                      style={{ fontSize: 12, color: "var(--ink-l)", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <p style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    {record.converted_donors}
                    {record.contacted_donors > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "var(--ink-l)" }}>
                        / {record.contacted_donors} contacted ({Math.round((record.converted_donors / record.contacted_donors) * 100)}%)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === "responses" && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["", "CONTACTED", "RESPONDED", "DONATED", "NOT_INTERESTED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setResponseFilter(s); setSelected([]); }}
                      className={responseFilter === s ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                    >
                      {s || "All"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { exportCampaignResponsesCSV(record.id); showToast({ type: "info", title: "Exporting", message: "CSV started." }); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--cr)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <RiDownloadLine size={13} /> Export CSV
                </button>
              </div>

              {selected.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{selected.length} selected</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    style={{ borderRadius: 10, border: "1px solid var(--border)", padding: "6px 10px", fontSize: 13, outline: "none" }}
                  >
                    <option value="">Set status…</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="RESPONDED">Responded</option>
                    <option value="DONATED">Donated</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleBulkUpdate} disabled={!bulkStatus || bulkSaving}>
                    {bulkSaving ? <span className="btn-spin" /> : null} Apply
                  </button>
                  <button onClick={() => setSelected([])} style={{ fontSize: 12, color: "var(--ink-l)", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
                </div>
              )}

              {responsesLoading ? (
                <AdminLoader text="Loading responses…" />
              ) : responses.length === 0 ? (
                <div className="empty-state"><RiUserLine size={28} /><p>No response records yet. Send a campaign blast to seed them automatically.</p></div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selected.length === responses.length}
                            onChange={(e) => setSelected(e.target.checked ? responses.map((r) => r.id) : [])}
                          />
                        </th>
                        <th>Donor</th>
                        <th>Blood Group</th>
                        <th>Status</th>
                        <th>Response Date</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selected.includes(r.id)}
                              onChange={(e) =>
                                setSelected((prev) =>
                                  e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id)
                                )
                              }
                            />
                          </td>
                          <td>
                            <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{r.donor_name}</p>
                            <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{r.donor_phone || r.donor_email}</p>
                          </td>
                          <td><span className="badge badge-red">{r.donor_blood_group || "—"}</span></td>
                          <td><ResponseBadge status={r.status} /></td>
                          <td style={{ fontSize: 12, color: "var(--ink-l)" }}>
                            {r.response_date ? new Date(r.response_date).toLocaleDateString("en-GB") : "—"}
                          </td>
                          <td>
                            <select
                              value={r.status}
                              onChange={(e) => handleStatusChange(r.id, e.target.value)}
                              style={{ borderRadius: 8, border: "1px solid var(--border)", padding: "4px 8px", fontSize: 12, outline: "none" }}
                            >
                              <option value="CONTACTED">Contacted</option>
                              <option value="RESPONDED">Responded</option>
                              <option value="DONATED">Donated</option>
                              <option value="NOT_INTERESTED">Not Interested</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCampaignHistory;
