import { useEffect, useState } from "react";
import {
  RiBarChart2Line,
  RiCloseLine,
  RiDownloadLine,
  RiRefreshLine,
  RiSearchLine,
  RiCheckboxCircleLine,
  RiEdit2Line,
} from "react-icons/ri";

import {
  getCampaignScanHistory,
  exportCampaignHistoryCSV,
  markCampaignConverted,
} from "../services/campaignService";
import { useToast } from "../context/ToastContext";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

  useEffect(() => {
    loadHistory();
  }, [page, bloodGroup]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleExport = () => {
    exportCampaignHistoryCSV(bloodGroup);
    showToast({ type: "info", title: "Exporting", message: "CSV download started." });
  };

  const conversionRate = (record) => {
    if (!record.contacted_donors) return "—";
    return `${Math.round((record.converted_donors / record.contacted_donors) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">Campaign Analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Campaign Scan History
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            Full history of personalized donor campaign scans with contact and
            conversion tracking.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadHistory}>
            <RiRefreshLine />
            Refresh
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            <RiDownloadLine />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1" style={{ minWidth: 200 }}>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Search
            </label>
            <div className="relative">
              <RiSearchLine
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Campaign name, blood group, created by…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => { setBloodGroup(e.target.value); setPage(1); }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg || "All Blood Groups"}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">
            <RiSearchLine />
            Search
          </Button>
        </form>
      </Card>

      {/* Summary stat row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {total} scan{total !== 1 ? "s" : ""} recorded
        </p>
        <div className="flex gap-2 text-xs text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            No campaign scan records found.
          </div>
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
                {records.map((record) => (
                  <tr key={record.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                    <td className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">
                        {record.campaign_name || `Scan #${record.id}`}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {record.radius_km} km radius
                      </p>
                    </td>
                    <td className="p-3">
                      <Badge label={record.blood_group || "All"} variant="donor" />
                    </td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{record.total_matches}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400">{record.available_donors}</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400">{record.contacted_donors}</td>
                    <td className="p-3 text-purple-600 dark:text-purple-400">{record.converted_donors}</td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{conversionRate(record)}</td>
                    <td className="p-3 text-[var(--text-secondary)]">
                      {Math.round((record.average_availability_score || 0) * 100)}%
                    </td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">
                      {new Date(record.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedRecord(record)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Prev
            </Button>
            <span className="text-sm text-[var(--text-secondary)]">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>

      {selectedRecord && (
        <CampaignDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onConverted={(id, count) => {
            setRecords((prev) =>
              prev.map((r) => (r.id === id ? { ...r, converted_donors: count } : r))
            );
            setSelectedRecord((prev) => prev && prev.id === id ? { ...prev, converted_donors: count } : prev);
          }}
        />
      )}
    </div>
  );
}

function CampaignDetailModal({ record, onClose, onConverted }) {
  const { showToast } = useToast();
  const [editingConverted, setEditingConverted] = useState(false);
  const [convertedInput, setConvertedInput] = useState(record.converted_donors ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSaveConverted = async () => {
    try {
      setSaving(true);
      await markCampaignConverted(record.id, Number(convertedInput));
      onConverted(record.id, Number(convertedInput));
      setEditingConverted(false);
      showToast({ type: "success", title: "Saved", message: "Conversion count updated." });
    } catch {
      showToast({ type: "error", title: "Save Failed", message: "Could not update conversion count." });
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    { label: "Total Matched", value: record.total_matches, color: "" },
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
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

        <div className="space-y-5 p-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">
              Blood Group: {record.blood_group || "All"}
            </span>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">
              Radius: {record.radius_km} km
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Contacted: {record.contacted_donors}
            </span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
              Converted: {record.converted_donors}
            </span>
          </div>

          {/* Scores */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Avg Availability Score</p>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                {Math.round((record.average_availability_score || 0) * 100)}%
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Avg Priority Score</p>
              <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                {Math.round((record.average_campaign_priority_score || 0) * 100)}%
              </p>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {rows.map(({ label, value, color }) => (
                  <tr key={label} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="p-3 text-[var(--text-secondary)]">{label}</td>
                    <td className={`p-3 text-right font-semibold ${color || "text-[var(--text-primary)]"}`}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Converted donors edit */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Track Conversions</p>
                <p className="text-xs text-[var(--text-muted)]">
                  How many contacted donors actually donated?
                </p>
              </div>
              {!editingConverted && (
                <button
                  onClick={() => setEditingConverted(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--crimson)] hover:underline"
                >
                  <RiEdit2Line size={13} /> Edit
                </button>
              )}
            </div>

            {editingConverted ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={record.contacted_donors || 9999}
                  value={convertedInput}
                  onChange={(e) => setConvertedInput(e.target.value)}
                  className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--crimson)]"
                />
                <Button size="sm" onClick={handleSaveConverted} loading={saving}>
                  <RiCheckboxCircleLine /> Save
                </Button>
                <button
                  onClick={() => { setEditingConverted(false); setConvertedInput(record.converted_donors ?? 0); }}
                  className="text-xs text-[var(--text-muted)] hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {record.converted_donors}
                {record.contacted_donors > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                    / {record.contacted_donors} contacted (
                    {Math.round((record.converted_donors / record.contacted_donors) * 100)}%)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCampaignHistory;
