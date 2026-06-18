import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiPhoneLine,
  RiRefreshLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiToggleLine,
  RiWhatsappLine,
} from "react-icons/ri";

import {
  getAdminWhatsAppSettings,
  toggleAdminWhatsApp,
  sendAdminWhatsAppTest,
  getAdminWhatsAppLogs,
  sendBulkWhatsApp,
} from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const STATUS_CFG = {
  SENT:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Sent" },
  FAILED:  { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                label: "Failed" },
  SKIPPED: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",        label: "Skipped" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.FAILED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
  );
}

function AdminWhatsApp() {
  const { showToast } = useToast();
  const [tab, setTab] = useState("settings");

  // ── Settings ──
  const [settings, setSettings] = useState(null);
  const [toggling, setToggling] = useState(false);

  // ── Test ──
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // ── Logs ──
  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({ total: 0, page: 1, total_pages: 1, sent_count: 0, failed_count: 0, skipped_count: 0 });
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logsLoading, setLogsLoading] = useState(false);

  // ── Bulk ──
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
    const ids = bulkDonorIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (!ids.length) { showToast({ type: "warning", title: "No IDs", message: "Enter at least one donor ID." }); return; }
    if (!bulkTemplate && !bulkMessage.trim()) { showToast({ type: "warning", title: "Missing", message: "Enter a message or enable template." }); return; }
    if (bulkTemplate && !bulkTemplateName.trim()) { showToast({ type: "warning", title: "Missing", message: "Enter a template name." }); return; }

    try {
      setBulkSending(true);
      const data = await sendBulkWhatsApp({
        donor_ids: ids,
        message: bulkMessage,
        use_template: bulkTemplate,
        template_name: bulkTemplateName,
      });
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--crimson)]">Messaging</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">WhatsApp Management</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
          Configure Meta WhatsApp Business Cloud API, send test messages, run bulk campaigns, and monitor delivery logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-t-lg px-5 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-b-2 border-[var(--crimson)] text-[var(--crimson)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
                  <RiWhatsappLine size={24} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">WhatsApp Notifications</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Powered by Meta WhatsApp Business Cloud API v19.0
                  </p>
                  {settings?.updated_by && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Last updated by {settings.updated_by} on {new Date(settings.updated_at).toLocaleString("en-GB")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${settings?.whatsapp_enabled ? "text-emerald-600" : "text-slate-500"}`}>
                  {settings?.whatsapp_enabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  onClick={handleToggle}
                  disabled={toggling || !settings}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                    settings?.whatsapp_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      settings?.whatsapp_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <p className="mb-3 font-semibold text-[var(--text-primary)]">Required Django Settings</p>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Add the following to your <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">settings.py</code>:
            </p>
            <pre className="overflow-x-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs text-[var(--text-secondary)]">{`# WhatsApp Business Cloud API
WHATSAPP_ACCESS_TOKEN = "your_meta_access_token_here"
WHATSAPP_PHONE_NUMBER_ID = "your_phone_number_id_here"
SEND_WHATSAPP_NOTIFICATIONS = True  # fallback if DB toggle not set`}</pre>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Get these values from Meta Business Suite → Business Settings → WhatsApp Accounts.
            </p>
          </Card>
        </div>
      )}

      {/* ── Test ── */}
      {tab === "test" && (
        <Card>
          <p className="mb-4 font-semibold text-[var(--text-primary)]">Send a Test Message</p>
          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Phone Number *</label>
              <div className="relative">
                <RiPhoneLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="tel" required value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+256700000000"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="useTemplate" checked={useTemplate}
                onChange={(e) => setUseTemplate(e.target.checked)}
                className="accent-[var(--crimson)]"
              />
              <label htmlFor="useTemplate" className="text-sm text-[var(--text-secondary)]">Use approved template</label>
            </div>

            {useTemplate ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Template Name *</label>
                <input
                  value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. donation_reminder"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Message</label>
                <textarea
                  rows={3} value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter your test message…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Free-text messages only work within a 24-hour customer-initiated window.
                </p>
              </div>
            )}

            <Button type="submit" loading={testing}>
              <RiSendPlaneLine /> Send Test
            </Button>
          </form>

          {testResult && (
            <div className={`mt-4 rounded-xl border p-4 ${
              testResult.success
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                : testResult.skipped
                ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success
                  ? <RiCheckboxCircleLine size={18} className="text-emerald-600" />
                  : <RiCloseLine size={18} className="text-red-500" />}
                <p className="text-sm font-semibold">
                  {testResult.success ? "Delivered" : testResult.skipped ? "Skipped (duplicate)" : "Failed"}
                </p>
              </div>
              {testResult.detail && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{testResult.detail}</p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Bulk Send ── */}
      {tab === "bulk" && (
        <Card>
          <p className="mb-1 font-semibold text-[var(--text-primary)]">Bulk WhatsApp</p>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Only donors with <strong>WhatsApp consent</strong> will receive messages.
          </p>
          <form onSubmit={handleBulkSend} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Donor IDs (comma-separated) *
              </label>
              <input
                value={bulkDonorIds} onChange={(e) => setBulkDonorIds(e.target.value)}
                placeholder="1, 2, 3, …"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="bulkTemplate" checked={bulkTemplate}
                onChange={(e) => setBulkTemplate(e.target.checked)}
                className="accent-[var(--crimson)]"
              />
              <label htmlFor="bulkTemplate" className="text-sm text-[var(--text-secondary)]">Use approved template</label>
            </div>

            {bulkTemplate ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Template Name *</label>
                <input
                  value={bulkTemplateName} onChange={(e) => setBulkTemplateName(e.target.value)}
                  placeholder="e.g. donation_reminder"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Message *</label>
                <textarea
                  rows={4} value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Campaign message for donors…"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                />
              </div>
            )}

            <Button type="submit" loading={bulkSending}>
              <RiSendPlaneLine /> Send to All
            </Button>
          </form>
        </Card>
      )}

      {/* ── Logs ── */}
      {tab === "logs" && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Sent",    value: logMeta.sent_count,    color: "text-emerald-600" },
              { label: "Failed",  value: logMeta.failed_count,  color: "text-red-600" },
              { label: "Skipped", value: logMeta.skipped_count, color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <Card>
            <form onSubmit={handleLogSearch} className="flex flex-wrap items-end gap-3">
              <div className="flex-1" style={{ minWidth: 200 }}>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Search</label>
                <div className="relative">
                  <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    value={logSearch} onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Phone, message, template, email…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--crimson)]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Status</label>
                <select
                  value={logStatus} onChange={(e) => { setLogStatus(e.target.value); setLogPage(1); }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--crimson)]"
                >
                  <option value="">All</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="SKIPPED">Skipped</option>
                </select>
              </div>
              <Button type="submit"><RiSearchLine /> Search</Button>
              <Button variant="secondary" type="button" onClick={() => { setLogPage(1); loadLogs(); }}>
                <RiRefreshLine />
              </Button>
            </form>
          </Card>

          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>{logMeta.total} log entr{logMeta.total !== 1 ? "ies" : "y"}</span>
            <span>Page {logMeta.page} of {logMeta.total_pages}</span>
          </div>

          <Card>
            {logsLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
              </div>
            ) : logs.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--text-secondary)]">No WhatsApp logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="p-3 font-medium">Phone</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Message / Template</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Recipient</th>
                      <th className="p-3 font-medium">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                        <td className="p-3 font-mono text-xs text-[var(--text-primary)]">{log.phone_number}</td>
                        <td className="p-3">
                          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs capitalize">
                            {log.message_type || "text"}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          {log.message_type === "template" ? (
                            <span className="font-medium text-[var(--crimson)]">{log.template_name}</span>
                          ) : (
                            <span className="line-clamp-1 text-[var(--text-secondary)]">{log.message}</span>
                          )}
                        </td>
                        <td className="p-3"><StatusBadge status={log.status} /></td>
                        <td className="p-3 text-xs text-[var(--text-muted)]">{log.recipient_email || "—"}</td>
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

            {logMeta.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setLogPage((p) => Math.max(1, p - 1))} disabled={logPage === 1}>← Prev</Button>
                <span className="text-sm text-[var(--text-secondary)]">{logPage} / {logMeta.total_pages}</span>
                <Button variant="secondary" size="sm" onClick={() => setLogPage((p) => Math.min(logMeta.total_pages, p + 1))} disabled={logPage === logMeta.total_pages}>Next →</Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminWhatsApp;
