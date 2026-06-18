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

import Card from "../components/common/Card";
import Button from "../components/common/Button";

const STATUS_CONFIG = {
  SENT:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  FAILED:  { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
  SKIPPED: { cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400", dot: "bg-slate-400" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SKIPPED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function AdminSMS() {
  const { showToast } = useToast();

  // SMS Setting
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [settingLoading, setSettingLoading] = useState(false);
  const [settingInfo, setSettingInfo] = useState(null);

  // Test SMS
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  // Bulk SMS
  const [bulkIds, setBulkIds] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Logs
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
      showToast({
        type: "success",
        title: "SMS Setting Updated",
        message: data.message,
      });
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
      showToast({
        type: "success",
        title: "Bulk SMS Complete",
        message: `Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}`,
      });
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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--crimson)]">SMS Management</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          SMS Integration
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
          Toggle SMS delivery, send test messages, run bulk SMS campaigns, and
          review the full delivery log.
        </p>
      </div>

      {/* Global toggle + stats row */}
      <div className="grid gap-5 md:grid-cols-4">
        <Card className="md:col-span-1">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
            <RiSettings4Line size={22} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">SMS Status</p>
          <p className={`mt-1 text-xl font-bold ${smsEnabled ? "text-emerald-600" : "text-red-600"}`}>
            {smsEnabled ? "Enabled" : "Disabled"}
          </p>
          {settingInfo?.updated_at && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Last changed: {new Date(settingInfo.updated_at).toLocaleDateString("en-GB")}
            </p>
          )}
          <Button
            className="mt-4 w-full"
            variant={smsEnabled ? "secondary" : "primary"}
            loading={settingLoading}
            onClick={handleToggle}
          >
            {smsEnabled ? "Disable SMS" : "Enable SMS"}
          </Button>
        </Card>

        <StatCard icon={RiCheckboxCircleLine} label="Total Sent" value={logStats.sent_count} tone="emerald" />
        <StatCard icon={RiCloseCircleLine} label="Failed" value={logStats.failed_count} tone="red" />
        <StatCard icon={RiTimeLine} label="Skipped" value={logStats.skipped_count} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test SMS */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiMessage2Line size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Send Test SMS</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Verify delivery to a specific number.
              </p>
            </div>
          </div>

          <form onSubmit={handleTestSMS} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Phone Number
              </label>
              <input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+256700000000 or 0700000000"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Message (optional)
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Leave empty to use default test message…"
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>

            <Button type="submit" loading={testLoading}>
              <RiSendPlaneLine />
              Send Test SMS
            </Button>
          </form>
        </Card>

        {/* Bulk SMS */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20">
              <RiGroupLine size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Bulk SMS Campaign</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Send SMS to multiple donors by their profile IDs.
              </p>
            </div>
          </div>

          <form onSubmit={handleBulkSMS} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Donor Profile IDs
              </label>
              <textarea
                rows={3}
                value={bulkIds}
                onChange={(e) => setBulkIds(e.target.value)}
                placeholder="Comma or newline separated donor IDs, e.g.&#10;1, 2, 3"
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Tip: use Campaign Targeting to get the IDs of available donors, then paste here.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                Message
              </label>
              <textarea
                rows={3}
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Dear donor, UBTS urgently needs your blood donation…"
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>

            <Button type="submit" loading={bulkLoading}>
              <RiSendPlaneLine />
              Send Bulk SMS
            </Button>
          </form>
        </Card>
      </div>

      {/* Delivery Logs */}
      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">SMS Delivery Logs</h3>
            <p className="text-sm text-[var(--text-secondary)]">{logStats.total} total log entries</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadLogs}>
            <RiRefreshLine /> Refresh
          </Button>
        </div>

        {/* Log filters */}
        <form onSubmit={handleLogSearch} className="mb-5 flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth: 180 }}>
            <RiSearchLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Phone, message, email…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
            />
          </div>
          <select
            value={logStatus}
            onChange={(e) => { setLogStatus(e.target.value); setLogPage(1); }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--crimson)]"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        {logsLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
            No SMS log entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Recipient</th>
                  <th className="p-3 font-medium">Message</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Note</th>
                  <th className="p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-[var(--border)]">
                    <td className="p-3 font-mono text-xs text-[var(--text-primary)]">{log.phone_number}</td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">{log.recipient_email || "—"}</td>
                    <td className="p-3 max-w-xs">
                      <p className="line-clamp-2 text-xs text-[var(--text-secondary)]">{log.message}</p>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="p-3 max-w-xs">
                      {log.error_message ? (
                        <p className="line-clamp-1 text-xs text-red-500">{log.error_message}</p>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-[var(--text-muted)]">
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
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              disabled={logPage === 1}
            >
              ← Prev
            </Button>
            <span className="text-sm text-[var(--text-secondary)]">
              {logPage} / {logTotalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
              disabled={logPage === logTotalPages}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  };
  return (
    <Card>
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone] || tones.emerald}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </Card>
  );
}

export default AdminSMS;
