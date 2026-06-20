import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiGroupLine,
  RiMessage2Line,
  RiRefreshLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiSettings4Line,
  RiTimeLine,
} from "react-icons/ri";

import {
  getAdminSMSSettings,
  toggleAdminSMS,
  sendAdminSMSTest,
  getAdminSMSLogs,
  sendBulkSMS,
} from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import AdminLoader from "../components/common/AdminLoader";

const STATUS_BADGE = {
  SENT:    "badge-green",
  FAILED:  "badge-red",
  SKIPPED: "badge-gray",
};

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] ?? "badge-gray"}`}>{status}</span>;
}

function AdminSMS() {
  const { showToast } = useToast();

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [settingLoading, setSettingLoading] = useState(false);
  const [settingInfo, setSettingInfo] = useState(null);

  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const [bulkIds, setBulkIds] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logStats, setLogStats] = useState({ total: 0, sent_count: 0, failed_count: 0, skipped_count: 0 });
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [logPage, logStatus]);

  const loadSettings = async () => {
    try {
      const data = await getAdminSMSSettings();
      setSmsEnabled(data.sms_enabled);
      setSettingInfo(data);
    } catch {
      // silent
    }
  };

  const handleToggle = async () => {
    try {
      setSettingLoading(true);
      const data = await toggleAdminSMS(!smsEnabled);
      setSmsEnabled(data.sms_enabled);
      showToast({ type: "success", title: "SMS Setting Updated", message: data.message });
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not update SMS setting." });
    } finally {
      setSettingLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await getAdminSMSLogs({ page: logPage, page_size: 30, search: logSearch, status: logStatus });
      setLogs(data.logs || []);
      setLogTotalPages(data.total_pages || 1);
      setLogStats({
        total: data.total || 0,
        sent_count: data.sent_count || 0,
        failed_count: data.failed_count || 0,
        skipped_count: data.skipped_count || 0,
      });
    } catch {
      // silent
    } finally {
      setLogsLoading(false);
    }
  };

  const handleLogSearch = (e) => {
    e.preventDefault();
    setLogPage(1);
    loadLogs();
  };

  const handleTestSMS = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      showToast({ type: "error", title: "Missing", message: "Phone number is required." });
      return;
    }
    try {
      setTestLoading(true);
      const data = await sendAdminSMSTest({ phone_number: testPhone, message: testMessage || undefined });
      if (data.success) {
        showToast({ type: "success", title: "SMS Sent", message: `Test SMS delivered to ${testPhone}.` });
      } else if (data.skipped) {
        showToast({ type: "info", title: "SMS Skipped", message: data.detail || "SMS was skipped (duplicate or disabled)." });
      } else {
        showToast({ type: "error", title: "SMS Failed", message: data.detail || "Delivery failed." });
      }
      loadLogs();
    } catch (err) {
      showToast({ type: "error", title: "Error", message: err.response?.data?.error || "Test SMS failed." });
    } finally {
      setTestLoading(false);
    }
  };

  const handleBulkSMS = async (e) => {
    e.preventDefault();
    if (!bulkMessage.trim()) {
      showToast({ type: "error", title: "Missing", message: "Message is required." });
      return;
    }
    const donor_ids = bulkIds
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);

    if (!donor_ids.length) {
      showToast({ type: "error", title: "No IDs", message: "Enter at least one valid donor ID." });
      return;
    }
    try {
      setBulkLoading(true);
      const data = await sendBulkSMS({ donor_ids, message: bulkMessage });
      showToast({ type: "success", title: "Bulk SMS Complete", message: `Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}` });
      setBulkIds("");
      setBulkMessage("");
      loadLogs();
    } catch (err) {
      showToast({ type: "error", title: "Bulk SMS Failed", message: err.response?.data?.error || "Error." });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">SMS Management</div>
          <h1 className="page-title rh-display">SMS Integration</h1>
          <p className="page-desc">Toggle SMS delivery, send test messages, run bulk SMS campaigns, and review the full delivery log.</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* Status card */}
        <div className="stat-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
          <div className="stat-icon bl"><RiSettings4Line size={18} /></div>
          <div className="stat-body">
            <div className="stat-val" style={{ color: smsEnabled ? "var(--green,#16a34a)" : "var(--cr)" }}>
              {smsEnabled ? "Enabled" : "Disabled"}
            </div>
            <div className="stat-label">SMS Status</div>
            {settingInfo?.updated_at && (
              <div style={{ fontSize: 11, color: "var(--ink-l)", marginTop: 2 }}>
                Last changed: {new Date(settingInfo.updated_at).toLocaleDateString("en-GB")}
              </div>
            )}
          </div>
          <button
            className={`btn btn-sm ${smsEnabled ? "btn-outline" : "btn-primary"}`}
            style={{ marginTop: 4 }}
            onClick={handleToggle}
            disabled={settingLoading}
          >
            {settingLoading ? <span className="btn-spin" /> : null}
            {smsEnabled ? "Disable SMS" : "Enable SMS"}
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon gr"><RiCheckboxCircleLine size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{logStats.sent_count}</div>
            <div className="stat-label">Total Sent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cr"><RiCloseCircleLine size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{logStats.failed_count}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon am"><RiTimeLine size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{logStats.skipped_count}</div>
            <div className="stat-label">Skipped</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Test SMS */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiMessage2Line size={16} /></div>
              <div>
                <div className="panel-title">Send Test SMS</div>
                <div className="panel-sub">Verify delivery to a specific number.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleTestSMS} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Phone Number</label>
                <input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+256700000000 or 0700000000"
                  style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Message (optional)</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Leave empty to use default test message…"
                  style={{ width: "100%", resize: "none", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={testLoading}>
                {testLoading ? <span className="btn-spin" /> : <RiSendPlaneLine />} Send Test SMS
              </button>
            </form>
          </div>
        </div>

        {/* Bulk SMS */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon pu"><RiGroupLine size={16} /></div>
              <div>
                <div className="panel-title">Bulk SMS Campaign</div>
                <div className="panel-sub">Send SMS to multiple donors by their profile IDs.</div>
              </div>
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={handleBulkSMS} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Donor Profile IDs</label>
                <textarea
                  rows={3}
                  value={bulkIds}
                  onChange={(e) => setBulkIds(e.target.value)}
                  placeholder={"Comma or newline separated donor IDs, e.g.\n1, 2, 3"}
                  style={{ width: "100%", resize: "none", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ marginTop: 4, fontSize: 12, color: "var(--ink-l)" }}>Tip: use Campaign Targeting to get the IDs of available donors, then paste here.</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Message</label>
                <textarea
                  rows={3}
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Dear donor, UBTS urgently needs your blood donation…"
                  style={{ width: "100%", resize: "none", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={bulkLoading}>
                {bulkLoading ? <span className="btn-spin" /> : <RiSendPlaneLine />} Send Bulk SMS
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delivery Logs */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon bl"><RiMessage2Line size={16} /></div>
            <div>
              <div className="panel-title">SMS Delivery Logs</div>
              <div className="panel-sub">{logStats.total} total log entries</div>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadLogs}><RiRefreshLine /> Refresh</button>
        </div>

        <div className="panel-body">
          <form onSubmit={handleLogSearch} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <RiSearchLine size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-l)" }} />
              <input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Phone, message, email…"
                style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <select
              value={logStatus}
              onChange={(e) => { setLogStatus(e.target.value); setLogPage(1); }}
              style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "8px 12px", fontSize: 13, outline: "none" }}
            >
              <option value="">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="SKIPPED">Skipped</option>
            </select>
            <button type="submit" className="btn btn-outline btn-sm">Search</button>
          </form>

          {logsLoading ? (
            <AdminLoader text="Loading SMS logs…" />
          ) : logs.length === 0 ? (
            <div className="empty-state"><RiMessage2Line size={28} /><p>No SMS log entries found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Recipient</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Note</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{log.phone_number}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-l)" }}>{log.recipient_email || "—"}</td>
                      <td style={{ maxWidth: 220 }}>
                        <p style={{ fontSize: 12, color: "var(--ink-s)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{log.message}</p>
                      </td>
                      <td><StatusBadge status={log.status} /></td>
                      <td style={{ maxWidth: 160 }}>
                        {log.error_message ? (
                          <p style={{ fontSize: 12, color: "var(--cr)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.error_message}</p>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--ink-l)" }}>—</span>
                        )}
                      </td>
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

          {logTotalPages > 1 && (
            <div className="pagination-row">
              <span className="page-info">{logPage} / {logTotalPages}</span>
              <div className="page-btns">
                <button className="page-btn" onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}>← Prev</button>
                <button className="page-btn" onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))} disabled={logPage === logTotalPages}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminSMS;
