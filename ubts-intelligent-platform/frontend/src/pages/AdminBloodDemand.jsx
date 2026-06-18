import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiNotification3Line,
  RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";

import {
  createBloodDemandAlert,
  getBloodDemandAlertsList,
  updateBloodDemandAlert,
  deleteBloodDemandAlert,
  resolveBloodDemandAlert,
  reNotifyBloodDemandAlert,
} from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_CFG = {
  CRITICAL: { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",      dot: "bg-red-500",    label: "Critical" },
  HIGH:     { cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500", label: "High" },
  MEDIUM:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",    dot: "bg-amber-500",  label: "Medium" },
  LOW:      { cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",       dot: "bg-slate-400",  label: "Low" },
};

const STATUS_CFG = {
  ACTIVE:   { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Active" },
  RESOLVED: { cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",            label: "Resolved" },
};

function UrgencyBadge({ level }) {
  const cfg = URGENCY_CFG[level] ?? URGENCY_CFG.HIGH;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.ACTIVE;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
  );
}

const EMPTY_FORM = {
  blood_group: "O+",
  title: "",
  message: "",
  urgency_level: "HIGH",
  units_needed: 1,
  hospital_name: "",
};

function AdminBloodDemand() {
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, total_pages: 1, active_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBG, setFilterBG] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Create/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editAlert, setEditAlert] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, [page, filterStatus, filterBG, filterUrgency]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getBloodDemandAlertsList({
        page, page_size: 20,
        status: filterStatus,
        blood_group: filterBG,
        urgency_level: filterUrgency,
        search,
      });
      setAlerts(data.alerts || []);
      setMeta({
        total: data.total,
        page: data.page,
        total_pages: data.total_pages,
        active_count: data.active_count,
        resolved_count: data.resolved_count,
      });
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load blood demand alerts." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const openCreate = () => {
    setEditAlert(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (alert) => {
    setEditAlert(alert);
    setForm({
      blood_group: alert.blood_group,
      title: alert.title,
      message: alert.message,
      urgency_level: alert.urgency_level,
      units_needed: alert.units_needed,
      hospital_name: alert.hospital_name || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast({ type: "warning", title: "Validation", message: "Title and message are required." });
      return;
    }
    try {
      setSaving(true);
      if (editAlert) {
        const updated = await updateBloodDemandAlert(editAlert.id, form);
        setAlerts((prev) => prev.map((a) => (a.id === editAlert.id ? updated : a)));
        showToast({ type: "success", title: "Updated", message: "Alert updated." });
      } else {
        const result = await createBloodDemandAlert(form);
        showToast({
          type: "success",
          title: "Alert Created",
          message: `Alert created. ${result.notified_count} donor(s) notified.`,
        });
        setPage(1);
        load();
      }
      setShowForm(false);
    } catch {
      showToast({ type: "error", title: "Save Failed", message: "Could not save alert." });
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (alert) => {
    try {
      const result = await resolveBloodDemandAlert(alert.id);
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? result.alert : a)));
      showToast({ type: "success", title: "Updated", message: result.message });
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not update alert status." });
    }
  };

  const handleReNotify = async (alert) => {
    try {
      const result = await reNotifyBloodDemandAlert(alert.id);
      showToast({ type: "success", title: "Re-notified", message: result.message });
      load();
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not re-notify donors." });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteBloodDemandAlert(deleteTarget.id);
      setAlerts((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast({ type: "success", title: "Deleted", message: "Alert deleted." });
      setDeleteTarget(null);
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not delete alert." });
    } finally {
      setDeleting(false);
    }
  };

  const fld = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">Notifications</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">Blood Demand Management</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            Raise blood demand alerts, set urgency levels, and notify matching eligible donors.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}><RiRefreshLine /> Refresh</Button>
          <Button onClick={openCreate}><RiAddLine /> New Alert</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Alerts",    value: meta.total,          color: "text-[var(--text-primary)]" },
          { label: "Active",          value: meta.active_count,   color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Resolved",        value: meta.resolved_count, color: "text-slate-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1" style={{ minWidth: 180 }}>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Search</label>
            <div className="relative">
              <RiSearchLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Title, message, hospital…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>
          </div>
          {[
            { label: "Status", value: filterStatus, set: setFilterStatus, opts: [["", "All Status"], ["ACTIVE", "Active"], ["RESOLVED", "Resolved"]] },
            { label: "Blood Group", value: filterBG, set: setFilterBG, opts: [["", "All Groups"], ...BLOOD_GROUPS.map((g) => [g, g])] },
            { label: "Urgency", value: filterUrgency, set: setFilterUrgency, opts: [["", "All Urgency"], ["CRITICAL", "Critical"], ["HIGH", "High"], ["MEDIUM", "Medium"], ["LOW", "Low"]] },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">{f.label}</label>
              <select
                value={f.value}
                onChange={(e) => { f.set(e.target.value); setPage(1); }}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              >
                {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <Button type="submit"><RiSearchLine /> Search</Button>
        </form>
      </Card>

      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <span>{meta.total} alert{meta.total !== 1 ? "s" : ""}</span>
        <span>Page {meta.page} of {meta.total_pages}</span>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center">
            <RiAlertLine size={36} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">No blood demand alerts found.</p>
            <Button className="mt-4" onClick={openCreate}><RiAddLine /> Create First Alert</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 font-medium">Blood Group</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Urgency</th>
                  <th className="p-3 font-medium">Units</th>
                  <th className="p-3 font-medium">Hospital</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Notified</th>
                  <th className="p-3 font-medium">Created</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                    <td className="p-3">
                      <span className="rounded-full bg-[var(--crimson)] px-2.5 py-0.5 text-xs font-bold text-white">
                        {a.blood_group}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="max-w-[200px] font-medium text-[var(--text-primary)] truncate">{a.title}</p>
                      {a.message && (
                        <p className="max-w-[200px] truncate text-xs text-[var(--text-muted)]">{a.message}</p>
                      )}
                    </td>
                    <td className="p-3"><UrgencyBadge level={a.urgency_level} /></td>
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{a.units_needed}</td>
                    <td className="p-3 text-xs text-[var(--text-secondary)]">{a.hospital_name || "—"}</td>
                    <td className="p-3"><StatusBadge status={a.status} /></td>
                    <td className="p-3 text-center font-semibold text-[var(--text-primary)]">{a.notified_count}</td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">
                      {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                        >
                          <RiEdit2Line size={16} />
                        </button>
                        <button
                          onClick={() => handleResolve(a)}
                          title={a.status === "ACTIVE" ? "Mark Resolved" : "Reactivate"}
                          className={`rounded-lg p-1.5 hover:bg-[var(--surface-2)] ${
                            a.status === "ACTIVE"
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-amber-600 hover:text-amber-700"
                          }`}
                        >
                          <RiCheckboxCircleLine size={16} />
                        </button>
                        {a.status === "ACTIVE" && (
                          <button
                            onClick={() => handleReNotify(a)}
                            title="Re-notify donors"
                            className="rounded-lg p-1.5 text-blue-500 hover:bg-[var(--surface-2)] hover:text-blue-700"
                          >
                            <RiNotification3Line size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(a)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-red-400 hover:bg-[var(--surface-2)] hover:text-red-600"
                        >
                          <RiDeleteBinLine size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <span className="text-sm text-[var(--text-secondary)]">{page} / {meta.total_pages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))} disabled={page === meta.total_pages}>Next →</Button>
          </div>
        )}
      </Card>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <h3 className="font-bold text-[var(--text-primary)]">
                {editAlert ? "Edit Alert" : "New Blood Demand Alert"}
              </h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]">
                <RiCloseLine size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-5">
              {/* Blood group + Urgency row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Blood Group *</label>
                  <select
                    value={form.blood_group} onChange={fld("blood_group")}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                  >
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Urgency Level *</label>
                  <select
                    value={form.urgency_level} onChange={fld("urgency_level")}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                  >
                    <option value="CRITICAL">🔴 Critical</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">⚪ Low</option>
                  </select>
                </div>
              </div>

              {/* Units + Hospital row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Units Needed</label>
                  <input
                    type="number" min={1} value={form.units_needed}
                    onChange={fld("units_needed")}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Hospital / Facility</label>
                  <input
                    type="text" value={form.hospital_name} onChange={fld("hospital_name")}
                    placeholder="e.g. Mulago National Referral"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Title *</label>
                <input
                  type="text" required value={form.title} onChange={fld("title")}
                  placeholder="e.g. Urgent: O+ Blood Needed"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Message *</label>
                <textarea
                  rows={4} required value={form.message} onChange={fld("message")}
                  placeholder="Describe the urgency and appeal to donors…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
                {!editAlert && (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    All eligible {form.blood_group || "matching"} donors will be notified in-app automatically.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>
                  {editAlert ? "Save Changes" : "Create & Notify Donors"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
              <RiDeleteBinLine size={22} />
            </div>
            <h3 className="font-bold text-[var(--text-primary)]">Delete Alert</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBloodDemand;
