import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiPhoneLine,
  RiRefreshLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiWhatsappLine,
} from "react-icons/ri";

import {
  getAdminWhatsAppSettings,
  toggleAdminWhatsApp,
  sendAdminWhatsAppTest,
  getAdminWhatsAppLogs,
  sendBulkWhatsApp,
} from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";
import AdminLoader from "../../components/common/AdminLoader";

const STATUS_BADGE = {
  SENT:    "badge-green",
  FAILED:  "badge-red",
  SKIPPED: "badge-amber",
};
const STATUS_LABEL = { SENT: "Sent", FAILED: "Failed", SKIPPED: "Skipped" };

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] ?? "badge-gray"}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function AdminWhatsApp() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("settings");

  const [settings, setSettings] = useState(null);
  const [toggling, setToggling] = useState(false);

  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({ total: 0, page: 1, total_pages: 1, sent_count: 0, failed_count: 0, skipped_count: 0 });
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);

  const [bulkDonorIds, setBulkDonorIds] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkTemplate, setBulkTemplate] = useState(false);
  const [bulkTemplateName, setBulkTemplateName] = useState("");
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { if (tab === "logs") loadLogs(); }, [tab, logPage, logStatus]);

  const loadSettings = async () => {
    try {
      const data = await getAdminWhatsAppSettings();
      setSettings(data);
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load WhatsApp settings." });
    }
  };

  const handleToggle = async () => {
    if (!settings) return;
    try {
      setToggling(true);
      const data = await toggleAdminWhatsApp(!settings.whatsapp_enabled);
      setSettings((prev) => ({ ...prev, whatsapp_enabled: data.whatsapp_enabled }));
      showToast({ type: "success", title: "Updated", message: data.message });
    } catch {
      showToast({ type: "error", title: "Toggle Failed", message: "Could not update WhatsApp toggle." });
    } finally {
      setToggling(false);
    }
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (!testPhone) return;
    try {
      setTesting(true);
      setTestResult(null);
      const data = await sendAdminWhatsAppTest({
        phone_number: testPhone,
        message: testMessage,
        use_template: useTemplate,
        template_name: templateName,
      });
      setTestResult(data);
      showToast({
        type: data.success ? "success" : data.skipped ? "info" : "error",
        title: data.success ? "Sent" : data.skipped ? "Skipped" : "Failed",
        message: data.detail || "Test complete.",
      });
    } catch {
      showToast({ type: "error", title: "Test Failed", message: "Could not send test message." });
    } finally {
      setTesting(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await getAdminWhatsAppLogs({ page: logPage, page_size: 30, search: logSearch, status: logStatus });
      setLogs(data.logs || []);
      setLogMeta({
        total: data.total,
        page: data.page,
        total_pages: data.total_pages,
        sent_count: data.sent_count,
        failed_count: data.failed_count,
        skipped_count: data.skipped_count,
      });
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load WhatsApp logs." });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLogSearch = (e) => { e.preventDefault(); setLogPage(1); loadLogs(); };

  const handleBulkSend = async (e) => {
    e.preventDefault();
    const ids = bulkDonorIds.split(",").map((s) => s.trim()).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n) && n > 0);
    if (!ids.length) { showToast({ type: "warning", title: "No IDs", message: "Enter at least one donor ID." }); return; }
    if (!bulkTemplate && !bulkMessage.trim()) { showToast({ type: "warning", title: "Missing", message: "Enter a message or enable template." }); return; }
    if (bulkTemplate && !bulkTemplateName.trim()) { showToast({ type: "warning", title: "Missing", message: "Enter a template name." }); return; }

    try {
      setBulkSending(true);
      const data = await sendBulkWhatsApp({ donor_ids: ids, message: bulkMessage, use_template: bulkTemplate, template_name: bulkTemplateName });
      showToast({ type: "success", title: "Done", message: data.message });
      setBulkDonorIds("");
      setBulkMessage("");
    } catch {
      showToast({ type: "error", title: "Bulk Failed", message: "Bulk WhatsApp send failed." });
    } finally {
      setBulkSending(false);
    }
  };

  const TABS = [
    { key: "settings", label: "Settings" },
    { key: "test",     label: "Test Message" },
    { key: "bulk",     label: "Bulk Send" },
    { key: "logs",     label: "Logs" },
  ];

  const inputStyle = { width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Messaging</div>
          <h1 className="page-title rh-display">WhatsApp Management</h1>
          <p className="page-desc">Configure Meta WhatsApp Business Cloud API, send test messages, run bulk campaigns, and monitor delivery logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, border: "none", background: "transparent", cursor: "pointer",
              borderBottom: tab === t.key ? "2px solid var(--cr)" : "2px solid transparent",
              color: tab === t.key ? "var(--cr)" : "var(--ink-s)", marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel">
            <div className="panel-body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--cr-xl,#ffe4e8)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cr)", flexShrink: 0 }}>
                    <RiWhatsappLine size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>WhatsApp Notifications</p>
                    <p style={{ fontSize: 13, color: "var(--ink-s)", margin: "2px 0 0" }}>Powered by Meta WhatsApp Business Cloud API v19.0</p>
                    {settings?.updated_by && (
                      <p style={{ fontSize: 12, color: "var(--ink-l)", margin: "2px 0 0" }}>
                        Last updated by {settings.updated_by} on {new Date(settings.updated_at).toLocaleString("en-GB")}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: settings?.whatsapp_enabled ? "var(--green,#16a34a)" : "var(--ink-l)" }}>
                    {settings?.whatsapp_enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    onClick={handleToggle}
                    disabled={toggling || !settings}
                    style={{
                      position: "relative", display: "inline-flex", height: 28, width: 48, alignItems: "center", borderRadius: 999, border: "none", cursor: "pointer",
                      background: settings?.whatsapp_enabled ? "#22c55e" : "#cbd5e1", transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block", height: 20, width: 20, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transform: settings?.whatsapp_enabled ? "translateX(24px)" : "translateX(4px)", transition: "transform 0.2s",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-body">
              <p style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>Required Django Settings</p>
              <p style={{ fontSize: 13, color: "var(--ink-s)", marginBottom: 16 }}>
                Add the following to your <code style={{ borderRadius: 4, background: "var(--canvas)", padding: "2px 6px", fontSize: 12 }}>settings.py</code>:
              </p>
              <pre style={{ overflowX: "auto", borderRadius: 10, background: "var(--canvas)", padding: 16, fontSize: 12, color: "var(--ink-s)" }}>{`# WhatsApp Business Cloud API
WHATSAPP_ACCESS_TOKEN = "your_meta_access_token_here"
WHATSAPP_PHONE_NUMBER_ID = "your_phone_number_id_here"
SEND_WHATSAPP_NOTIFICATIONS = True  # fallback if DB toggle not set`}</pre>
              <p style={{ marginTop: 12, fontSize: 12, color: "var(--ink-l)" }}>
                Get these values from Meta Business Suite → Business Settings → WhatsApp Accounts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test */}
      {tab === "test" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiWhatsappLine size={16} /></div>
              <div className="panel-title">Send a Test Message</div>
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleTest} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Phone Number *</label>
                <div style={{ position: "relative" }}>
                  <RiPhoneLine size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-l)" }} />
                  <input
                    type="tel" required value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+256700000000"
                    style={{ ...inputStyle, paddingLeft: 32 }}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--ink-s)" }}>
                <input
                  type="checkbox" checked={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.checked)}
                  style={{ accentColor: "var(--cr)" }}
                />
                Use approved template
              </label>

              {useTemplate ? (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Template Name *</label>
                  <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. donation_reminder" style={inputStyle} />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Message</label>
                  <textarea
                    rows={3} value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter your test message…"
                    style={{ ...inputStyle, resize: "none" }}
                  />
                  <p style={{ marginTop: 4, fontSize: 12, color: "var(--ink-l)" }}>
                    Free-text messages only work within a 24-hour customer-initiated window.
                  </p>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={testing}>
                {testing ? <span className="btn-spin" /> : <RiSendPlaneLine />} Send Test
              </button>
            </form>

            {testResult && (
              <div style={{
                marginTop: 16, borderRadius: 12, border: `1px solid ${testResult.success ? "#bbf7d0" : testResult.skipped ? "#fde68a" : "#fecaca"}`,
                background: testResult.success ? "#f0fdf4" : testResult.skipped ? "#fffbeb" : "#fef2f2", padding: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {testResult.success
                    ? <RiCheckboxCircleLine size={18} style={{ color: "#16a34a" }} />
                    : <RiCloseLine size={18} style={{ color: "var(--cr)" }} />}
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                    {testResult.success ? "Delivered" : testResult.skipped ? "Skipped (duplicate)" : "Failed"}
                  </p>
                </div>
                {testResult.detail && (
                  <p style={{ marginTop: 4, fontSize: 12, color: "var(--ink-s)" }}>{testResult.detail}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Send */}
      {tab === "bulk" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon pu"><RiWhatsappLine size={16} /></div>
              <div>
                <div className="panel-title">Bulk WhatsApp</div>
                <div className="panel-sub">Only donors with WhatsApp consent will receive messages.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleBulkSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Donor IDs (comma-separated) *</label>
                <input value={bulkDonorIds} onChange={(e) => setBulkDonorIds(e.target.value)} placeholder="1, 2, 3, …" style={inputStyle} />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--ink-s)" }}>
                <input type="checkbox" checked={bulkTemplate} onChange={(e) => setBulkTemplate(e.target.checked)} style={{ accentColor: "var(--cr)" }} />
                Use approved template
              </label>

              {bulkTemplate ? (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Template Name *</label>
                  <input value={bulkTemplateName} onChange={(e) => setBulkTemplateName(e.target.value)} placeholder="e.g. donation_reminder" style={inputStyle} />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Message *</label>
                  <textarea rows={4} value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)} placeholder="Campaign message for donors…" style={{ ...inputStyle, resize: "none" }} />
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={bulkSending}>
                {bulkSending ? <span className="btn-spin" /> : <RiSendPlaneLine />} Send to All
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logs */}
      {tab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { label: "Sent",    value: logMeta.sent_count,    tone: "gr" },
              { label: "Failed",  value: logMeta.failed_count,  tone: "cr" },
              { label: "Skipped", value: logMeta.skipped_count, tone: "am" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.tone}`}><RiWhatsappLine size={16} /></div>
                <div className="stat-body">
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-body">
              <form onSubmit={handleLogSearch} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Search</label>
                  <div style={{ position: "relative" }}>
                    <RiSearchLine size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-l)" }} />
                    <input
                      value={logSearch} onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Phone, message, template, email…"
                      style={{ ...inputStyle, paddingLeft: 32 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-s)", marginBottom: 4 }}>Status</label>
                  <select
                    value={logStatus} onChange={(e) => { setLogStatus(e.target.value); setLogPage(1); }}
                    style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none" }}
                  >
                    <option value="">All</option>
                    <option value="SENT">Sent</option>
                    <option value="FAILED">Failed</option>
                    <option value="SKIPPED">Skipped</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm"><RiSearchLine /> Search</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setLogPage(1); loadLogs(); }}><RiRefreshLine /></button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-s)", marginBottom: 12 }}>
                <span>{logMeta.total} log entr{logMeta.total !== 1 ? "ies" : "y"}</span>
                <span>Page {logMeta.page} of {logMeta.total_pages}</span>
              </div>

              {logsLoading ? (
                <AdminLoader text="Loading WhatsApp logs…" />
              ) : logs.length === 0 ? (
                <div className="empty-state"><RiWhatsappLine size={28} /><p>No WhatsApp logs found.</p></div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Message / Template</th>
                        <th>Status</th>
                        <th>Recipient</th>
                        <th>Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontFamily: "monospace", fontSize: 12 }}>{log.phone_number}</td>
                          <td>
                            <span style={{ borderRadius: 999, background: "var(--canvas)", padding: "2px 8px", fontSize: 12, textTransform: "capitalize" }}>
                              {log.message_type || "text"}
                            </span>
                          </td>
                          <td style={{ maxWidth: 220 }}>
                            {log.message_type === "template" ? (
                              <span style={{ fontWeight: 600, color: "var(--cr)" }}>{log.template_name}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: "var(--ink-s)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{log.message}</span>
                            )}
                          </td>
                          <td><StatusBadge status={log.status} /></td>
                          <td style={{ fontSize: 12, color: "var(--ink-l)" }}>{log.recipient_email || "—"}</td>
                          <td style={{ fontSize: 12, color: "var(--ink-l)" }}>
                            {new Date(log.created_at).toLocaleString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {logMeta.total_pages > 1 && (
                <div className="pagination-row">
                  <span className="page-info">{logPage} / {logMeta.total_pages}</span>
                  <div className="page-btns">
                    <button className="page-btn" onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}>← Prev</button>
                    <button className="page-btn" onClick={() => setLogPage((p) => Math.min(logMeta.total_pages, p + 1))} disabled={logPage === logMeta.total_pages}>Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminWhatsApp;
