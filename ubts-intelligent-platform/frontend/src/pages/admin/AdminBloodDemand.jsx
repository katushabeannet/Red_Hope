import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCloseLine,
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
} from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import AdminLoader from "../../components/common/AdminLoader";
import DeleteBtn from "../../components/common/DeleteBtn";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_BADGE = {
  CRITICAL: "badge-red",
  HIGH:     "badge-amber",
  MEDIUM:   "badge-amber",
  LOW:      "badge-gray",
};
const URGENCY_LABEL = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };

function UrgencyBadge({ level }) {
  return (
    <span className={`badge ${URGENCY_BADGE[level] ?? "badge-amber"}`}>
      {URGENCY_LABEL[level] ?? level}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
      {status === "ACTIVE" ? "Active" : "Resolved"}
    </span>
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

const _BD_SPARK = [35, 60, 45, 80, 55, 70, 65];

function BdTierCard({ icon: Icon, label, value, tone = "red", tier = "sub", dark }) {
  const accentMap  = { red: "var(--cr)", green: "var(--green)", blue: "var(--blue)", amber: "var(--amber)" };
  const accentXlLt = { red: "#FDEEF1", green: "#F0FDF4", blue: "#EFF6FF", amber: "#FFFBEB" };
  const accentXlDk = { red: "rgba(196,30,58,.18)", green: "rgba(22,163,74,.18)", blue: "rgba(37,99,235,.18)", amber: "rgba(217,119,6,.18)" };
  const accent   = accentMap[tone]  || "var(--cr)";
  const accentXl = (dark ? accentXlDk : accentXlLt)[tone] || (dark ? "rgba(196,30,58,.18)" : "#FDEEF1");

  if (tier === "sub") {
    return (
      <div className="card-submain" style={{ "--accent": accent, "--accent-xl": accentXl }}>
        <div className="card-sub-icon"><Icon size={20} /></div>
        <div className="card-sub-val">{value ?? "—"}</div>
        <div className="card-sub-label">{label}</div>
        <div className="card-sub-sparkline">
          {_BD_SPARK.map((h, i) => <div key={i} className="card-sub-bar" style={{ height: `${h}%` }} />)}
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

function AdminBloodDemand() {
  const { showToast } = useToast();
  const { dark } = useTheme();

  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, total_pages: 1, active_count: 0, resolved_count: 0 });
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterBG, setFilterBG] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editAlert, setEditAlert] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
        showToast({ type: "success", title: "Alert Created", message: `Alert created. ${result.notified_count} donor(s) notified.` });
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

  const selectStyle = { width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const inputStyle = { ...selectStyle };

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Notifications</div>
          <h1 className="page-title rh-display">Blood Demand Management</h1>
          <p className="page-desc">Raise blood demand alerts, set urgency levels, and notify matching eligible donors.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={load}><RiRefreshLine /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><RiAddLine /> New Alert</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        <BdTierCard icon={RiAlertLine}          label="Total Alerts" value={meta.total}          tone="red"   tier="sub"    dark={dark} />
        <BdTierCard icon={RiCheckboxCircleLine} label="Active"       value={meta.active_count}   tone="green" tier="sub"    dark={dark} />
        <BdTierCard icon={RiNotification3Line}  label="Resolved"     value={meta.resolved_count} tone="blue"  tier="normal" dark={dark} />
      </div>

      <div className="panel">
        <div className="panel-body">
          <form onSubmit={handleSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Search</label>
              <div style={{ position: "relative" }}>
                <RiSearchLine size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-l)" }} />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, message, hospital…"
                  style={{ ...inputStyle, paddingLeft: 30 }}
                />
              </div>
            </div>
            {[
              { label: "Status", value: filterStatus, set: setFilterStatus, opts: [["", "All Status"], ["ACTIVE", "Active"], ["RESOLVED", "Resolved"]] },
              { label: "Blood Group", value: filterBG, set: setFilterBG, opts: [["", "All Groups"], ...BLOOD_GROUPS.map((g) => [g, g])] },
              { label: "Urgency", value: filterUrgency, set: setFilterUrgency, opts: [["", "All Urgency"], ["CRITICAL", "Critical"], ["HIGH", "High"], ["MEDIUM", "Medium"], ["LOW", "Low"]] },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>{f.label}</label>
                <select value={f.value} onChange={(e) => { f.set(e.target.value); setPage(1); }} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none" }}>
                  {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" className="btn btn-primary btn-sm"><RiSearchLine /> Search</button>
          </form>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-s)" }}>
        <span>{meta.total} alert{meta.total !== 1 ? "s" : ""}</span>
        <span>Page {meta.page} of {meta.total_pages}</span>
      </div>

      <div className="panel">
        <div className="panel-body">
          {loading ? (
            <AdminLoader text="Loading blood demand alerts…" />
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <RiAlertLine size={36} />
              <p>No blood demand alerts found.</p>
              <button className="btn btn-primary btn-sm" onClick={openCreate}><RiAddLine /> Create First Alert</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Title</th>
                    <th>Urgency</th>
                    <th>Units</th>
                    <th>Hospital</th>
                    <th>Status</th>
                    <th>Notified</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span style={{ borderRadius: 999, background: "var(--cr)", padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                          {a.blood_group}
                        </span>
                      </td>
                      <td>
                        <p style={{ maxWidth: 200, fontWeight: 600, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                        {a.message && (
                          <p style={{ maxWidth: 200, fontSize: 12, color: "var(--ink-l)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message}</p>
                        )}
                      </td>
                      <td><UrgencyBadge level={a.urgency_level} /></td>
                      <td style={{ fontWeight: 600 }}>{a.units_needed}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-s)" }}>{a.hospital_name || "—"}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{a.notified_count}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-l)" }}>
                        {new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => openEdit(a)}
                            title="Edit"
                            style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-l)" }}
                          >
                            <RiEdit2Line size={16} />
                          </button>
                          <button
                            onClick={() => handleResolve(a)}
                            title={a.status === "ACTIVE" ? "Mark Resolved" : "Reactivate"}
                            style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: a.status === "ACTIVE" ? "#16a34a" : "#d97706" }}
                          >
                            <RiCheckboxCircleLine size={16} />
                          </button>
                          {a.status === "ACTIVE" && (
                            <button
                              onClick={() => handleReNotify(a)}
                              title="Re-notify donors"
                              style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "#2563eb" }}
                            >
                              <RiNotification3Line size={16} />
                            </button>
                          )}
                          <DeleteBtn onClick={() => setDeleteTarget(a)} title="Delete alert" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta.total_pages > 1 && (
            <div className="pagination-row">
              <span className="page-info">{page} / {meta.total_pages}</span>
              <div className="page-btns">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <button className="page-btn" onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))} disabled={page === meta.total_pages}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "0 16px" }}>
          <div style={{ maxHeight: "90vh", width: "100%", maxWidth: 520, overflowY: "auto", borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface,#fff)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "20px 24px" }}>
              <h3 style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                {editAlert ? "Edit Alert" : "New Blood Demand Alert"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ borderRadius: 8, padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-l)" }}>
                <RiCloseLine size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Blood Group *</label>
                  <select value={form.blood_group} onChange={fld("blood_group")} style={selectStyle}>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Urgency Level *</label>
                  <select value={form.urgency_level} onChange={fld("urgency_level")} style={selectStyle}>
                    <option value="CRITICAL">🔴 Critical</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">⚪ Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Units Needed</label>
                  <input type="number" min={1} value={form.units_needed} onChange={fld("units_needed")} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Hospital / Facility</label>
                  <input type="text" value={form.hospital_name} onChange={fld("hospital_name")} placeholder="e.g. Mulago National Referral" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Title *</label>
                <input type="text" required value={form.title} onChange={fld("title")} placeholder="e.g. Urgent: O+ Blood Needed" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Message *</label>
                <textarea rows={4} required value={form.message} onChange={fld("message")} placeholder="Describe the urgency and appeal to donors…" style={{ ...inputStyle, resize: "vertical" }} />
                {!editAlert && (
                  <p style={{ marginTop: 4, fontSize: 12, color: "var(--ink-l)" }}>
                    All eligible {form.blood_group || "matching"} donors will be notified in-app automatically.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spin" /> : null}
                  {editAlert ? "Save Changes" : "Create & Notify Donors"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "0 16px" }}>
          <div style={{ width: "100%", maxWidth: 380, borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface,#fff)", padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "#dc2626" }}>
              <RiAlertLine size={22} />
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>Delete Alert</h3>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink-s)" }}>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
            </p>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <DeleteBtn onClick={confirmDelete} title={deleting ? "Deleting…" : "Confirm Delete"} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminBloodDemand;
