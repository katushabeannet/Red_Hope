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
} from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import AdminLoader from "../../components/common/AdminLoader";
import { v } from "../../utils/validators";

const STATUS_BADGE = {
  SENT:    "badge-green",
  FAILED:  "badge-red",
  SKIPPED: "badge-gray",
};

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] ?? "badge-gray"}`}>{status}</span>;
}

const _SMS_SPARK = [25, 55, 45, 80, 60, 70, 50];

function SmsTierCard({ icon: Icon, label, value, tone = "blue", tier = "sub", dark, children }) {
  const accentMap  = { blue: "var(--blue)", green: "var(--green)", amber: "var(--amber)", red: "var(--cr)" };
  const accentXlLt = { blue: "#EFF6FF", green: "#F0FDF4", amber: "#FFFBEB", red: "#FDEEF1" };
  const accentXlDk = { blue: "rgba(37,99,235,.18)", green: "rgba(22,163,74,.18)", amber: "rgba(217,119,6,.18)", red: "rgba(196,30,58,.18)" };
  const accent   = accentMap[tone]  || "var(--blue)";
  const accentXl = (dark ? accentXlDk : accentXlLt)[tone] || (dark ? "rgba(37,99,235,.18)" : "#EFF6FF");

  if (tier === "sub") {
    return (
      <div className="card-submain" style={{ "--accent": accent, "--accent-xl": accentXl }}>
        <div className="card-sub-icon"><Icon size={20} /></div>
        <div className="card-sub-val">{value ?? "—"}</div>
        <div className="card-sub-label">{label}</div>
        {children ? <div style={{ marginTop: 8 }}>{children}</div> : (
          <div className="card-sub-sparkline">
            {_SMS_SPARK.map((h, i) => <div key={i} className="card-sub-bar" style={{ height: `${h}%` }} />)}
          </div>
        )}
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

function AdminSMS() {
  const { showToast } = useToast();
  const { dark } = useTheme();

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
    const phoneErr = v.phone(testPhone);
    if (phoneErr) { showToast({ type: "error", title: "Invalid Phone", message: phoneErr }); return; }
    const msgErr = testMessage ? v.smsLen(testMessage) : null;
    if (msgErr) { showToast({ type: "error", title: "Message Too Long", message: msgErr }); return; }
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
    const msgErr = v.smsLen(bulkMessage) || (!bulkMessage.trim() ? "Message is required." : null);
    if (msgErr) { showToast({ type: "error", title: "Message Error", message: msgErr }); return; }
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

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
        <SmsTierCard icon={RiSettings4Line} label="SMS Status" value={smsEnabled ? "Enabled" : "Disabled"} tone="blue" tier="sub" dark={dark}>
          <button
            className={`btn btn-sm ${smsEnabled ? "btn-outline" : "btn-primary"}`}
            onClick={handleToggle}
            disabled={settingLoading}
            style={{ fontSize: 12 }}
          >
            {settingLoading ? <span className="btn-spin" /> : null}
            {smsEnabled ? "Disable" : "Enable"}
          </button>
        </SmsTierCard>
        <SmsTierCard icon={RiCheckboxCircleLine} label="Total Sent"  value={logStats.sent_count}    tone="green" tier="sub"    dark={dark} />
        <SmsTierCard icon={RiCloseCircleLine}    label="Failed"      value={logStats.failed_count}   tone="red"   tier="normal" dark={dark} />
        <SmsTierCard icon={RiTimeLine}           label="Skipped"     value={logStats.skipped_count}  tone="amber" tier="normal" dark={dark} />
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Message (optional, ≤ 160 chars)</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Leave empty to use default test message…"
                  maxLength={160}
                  style={{ width: "100%", resize: "none", borderRadius: 10, border: `1px solid ${testMessage.length > 160 ? "#DC2626" : "var(--border)"}`, background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: testMessage.length > 150 ? "#DC2626" : "var(--ink-l)", float: "right", marginTop: 2 }}>{testMessage.length}/160</span>
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Message * (≤ 160 chars)</label>
                <textarea
                  rows={3}
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Dear donor, UBTS urgently needs your blood donation…"
                  maxLength={160}
                  style={{ width: "100%", resize: "none", borderRadius: 10, border: `1px solid ${bulkMessage.length > 160 ? "#DC2626" : "var(--border)"}`, background: "var(--canvas)", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 11, color: bulkMessage.length > 150 ? "#DC2626" : "var(--ink-l)", float: "right", marginTop: 2 }}>{bulkMessage.length}/160</span>
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
