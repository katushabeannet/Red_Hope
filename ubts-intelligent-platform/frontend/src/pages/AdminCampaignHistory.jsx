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

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RESPONSE_STATUS_CONFIG = {
  CONTACTED:     { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",     dot: "bg-blue-500",     label: "Contacted" },
  RESPONDED:     { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500",    label: "Responded" },
  DONATED:       { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500", label: "Donated" },
  NOT_INTERESTED:{ cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",    dot: "bg-slate-400",   label: "Not Interested" },
};

function ResponseBadge({ status }) {
  const cfg = RESPONSE_STATUS_CONFIG[status] ?? RESPONSE_STATUS_CONFIG.CONTACTED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">Campaign Analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">Campaign Scan History</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            Full history of personalized donor campaign scans with contact, conversion, and response tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadHistory}><RiRefreshLine /> Refresh</Button>
          <Button variant="secondary" onClick={handleExport}><RiDownloadLine /> Export CSV</Button>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1" style={{ minWidth: 200 }}>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Search</label>
            <div className="relative">
              <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Campaign name, blood group, created by…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => { setBloodGroup(e.target.value); setPage(1); }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg || "All Blood Groups"}</option>
              ))}
            </select>
          </div>
          <Button type="submit"><RiSearchLine /> Search</Button>
        </form>
      </Card>

      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>{total} scan{total !== 1 ? "s" : ""} recorded</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-secondary)]">No campaign scan records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 font-medium">Campaign</th>
                  <th className="p-3 font-medium">Blood Group</th>
                  <th className="p-3 font-medium">Matched</th>
                  <th className="p-3 font-medium">Available</th>
                  <th className="p-3 font-medium">Contacted</th>
                  <th className="p-3 font-medium">Converted</th>
                  <th className="p-3 font-medium">Conv. Rate</th>
                  <th className="p-3 font-medium">Avg Avail.</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                    <td className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">{r.campaign_name || `Scan #${r.id}`}</p>
                      <p className="text-xs text-[var(--text-muted)]">{r.radius_km} km radius</p>
                    </td>
                    <td className="p-3"><Badge label={r.blood_group || "All"} variant="donor" /></td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{r.total_matches}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400">{r.available_donors}</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400">{r.contacted_donors}</td>
                    <td className="p-3 text-purple-600 dark:text-purple-400">{r.converted_donors}</td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{conversionRate(r)}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{Math.round((r.average_availability_score || 0) * 100)}%</td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedRecord(r)}>Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <span className="text-sm text-[var(--text-secondary)]">{page} / {totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
          </div>
        )}
      </Card>

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
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function CampaignDetailModal({ record, onClose, onRecordUpdate }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Overview – conversion edit
  const [editingConverted, setEditingConverted] = useState(false);
  const [convertedInput, setConvertedInput] = useState(record.converted_donors ?? 0);
  const [savingConverted, setSavingConverted] = useState(false);

  // Responses tab
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
    { label: "Available", value: record.available_donors, color: "text-emerald-600" },
    { label: "Unavailable", value: record.unavailable_donors, color: "text-amber-600" },
    { label: "High Priority", value: record.high_priority_donors, color: "text-red-600" },
    { label: "Medium Priority", value: record.medium_priority_donors, color: "text-amber-600" },
    { label: "Low Priority", value: record.low_priority_donors, color: "text-slate-500" },
    { label: "Ineligible", value: record.ineligible_donors, color: "text-red-400" },
    { label: "Outside Radius", value: record.outside_radius_donors, color: "text-slate-500" },
    { label: "Skipped", value: record.skipped_donors, color: "text-slate-400" },
  ];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiBarChart2Line size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)]">
                {record.campaign_name || `Campaign Scan #${record.id}`}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(record.created_at).toLocaleString("en-GB")} — by {record.created_by || "Admin"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]">
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] px-5 pt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === t.key
                  ? "border-b-2 border-[var(--crimson)] text-[var(--crimson)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-5 p-5">
          {activeTab === "overview" && (
            <>
              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: `Blood Group: ${record.blood_group || "All"}` },
                  { label: `Radius: ${record.radius_km} km` },
                  { label: `Contacted: ${record.contacted_donors}`, cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
                  { label: `Converted: ${record.converted_donors}`, cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
                ].map((p) => (
                  <span key={p.label} className={`rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold ${p.cls || ""}`}>
                    {p.label}
                  </span>
                ))}
              </div>

              {/* Score cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Avg Availability Score", value: `${Math.round((record.average_availability_score || 0) * 100)}%` },
                  { label: "Avg Priority Score", value: `${Math.round((record.average_campaign_priority_score || 0) * 100)}%` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {overviewRows.map(({ label, value, color }) => (
                      <tr key={label} className="border-t border-[var(--border)] first:border-t-0">
                        <td className="p-3 text-[var(--text-secondary)]">{label}</td>
                        <td className={`p-3 text-right font-semibold ${color || "text-[var(--text-primary)]"}`}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conversion edit */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Manual Conversion Override</p>
                    <p className="text-xs text-[var(--text-muted)]">Override converted count if not using response tracking.</p>
                  </div>
                  {!editingConverted && (
                    <button onClick={() => setEditingConverted(true)} className="flex items-center gap-1 text-xs font-semibold text-[var(--crimson)] hover:underline">
                      <RiEdit2Line size={13} /> Edit
                    </button>
                  )}
                </div>
                {editingConverted ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="number" min={0} value={convertedInput}
                      onChange={(e) => setConvertedInput(e.target.value)}
                      className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--crimson)]"
                    />
                    <Button size="sm" onClick={handleSaveConverted} loading={savingConverted}>
                      <RiCheckboxCircleLine /> Save
                    </Button>
                    <button onClick={() => { setEditingConverted(false); setConvertedInput(record.converted_donors ?? 0); }}
                      className="text-xs text-[var(--text-muted)] hover:underline">Cancel</button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {record.converted_donors}
                    {record.contacted_donors > 0 && (
                      <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
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
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {["", "CONTACTED", "RESPONDED", "DONATED", "NOT_INTERESTED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setResponseFilter(s); setSelected([]); }}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        responseFilter === s
                          ? "border-[var(--crimson)] bg-[var(--crimson)] text-white"
                          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--crimson)]"
                      }`}
                    >
                      {s || "All"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { exportCampaignResponsesCSV(record.id); showToast({ type: "info", title: "Exporting", message: "CSV started." }); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--crimson)] hover:underline"
                >
                  <RiDownloadLine size={13} /> Export CSV
                </button>
              </div>

              {/* Bulk action bar */}
              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{selected.length} selected</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--crimson)]"
                  >
                    <option value="">Set status…</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="RESPONDED">Responded</option>
                    <option value="DONATED">Donated</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                  </select>
                  <Button size="sm" onClick={handleBulkUpdate} loading={bulkSaving} disabled={!bulkStatus}>
                    Apply
                  </Button>
                  <button onClick={() => setSelected([])} className="text-xs text-[var(--text-muted)] hover:underline">Clear</button>
                </div>
              )}

              {responsesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
                </div>
              ) : responses.length === 0 ? (
                <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
                  No response records yet. Send a campaign blast to seed them automatically.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                      <tr>
                        <th className="p-3">
                          <input
                            type="checkbox"
                            checked={selected.length === responses.length}
                            onChange={(e) => setSelected(e.target.checked ? responses.map((r) => r.id) : [])}
                          />
                        </th>
                        <th className="p-3 font-medium">Donor</th>
                        <th className="p-3 font-medium">Blood Group</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Response Date</th>
                        <th className="p-3 font-medium">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((r) => (
                        <tr key={r.id} className="border-t border-[var(--border)]">
                          <td className="p-3">
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
                          <td className="p-3">
                            <p className="font-medium text-[var(--text-primary)]">{r.donor_name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{r.donor_phone || r.donor_email}</p>
                          </td>
                          <td className="p-3">
                            <Badge label={r.donor_blood_group || "—"} variant="donor" />
                          </td>
                          <td className="p-3"><ResponseBadge status={r.status} /></td>
                          <td className="p-3 text-xs text-[var(--text-muted)]">
                            {r.response_date
                              ? new Date(r.response_date).toLocaleDateString("en-GB")
                              : "—"}
                          </td>
                          <td className="p-3">
                            <select
                              value={r.status}
                              onChange={(e) => handleStatusChange(r.id, e.target.value)}
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs outline-none focus:border-[var(--crimson)]"
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
