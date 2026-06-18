import { useEffect, useState } from "react";
import { RiAlertLine, RiHeartPulseLine, RiRefreshLine } from "react-icons/ri";

import { getDonorBloodDemandAlerts } from "../services/notificationService";
import { useToast } from "../context/ToastContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const URGENCY_CFG = {
  CRITICAL: {
    border: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-900/10",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
    icon: "text-red-500",
    label: "Critical",
  },
  HIGH: {
    border: "border-orange-300 dark:border-orange-700",
    bg: "bg-orange-50 dark:bg-orange-900/10",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
    icon: "text-orange-500",
    label: "High",
  },
  MEDIUM: {
    border: "border-amber-300 dark:border-amber-700",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-400",
    icon: "text-amber-500",
    label: "Medium",
  },
  LOW: {
    border: "border-[var(--border)]",
    bg: "bg-[var(--surface-2)]",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: "text-slate-400",
    label: "Low",
  },
};

function AlertCard({ alert }) {
  const cfg = URGENCY_CFG[alert.urgency_level] ?? URGENCY_CFG.HIGH;
  const issuedAt = new Date(alert.created_at).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className={`rounded-2xl border-2 p-5 transition ${cfg.border} ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex-shrink-0 ${cfg.icon}`}>
            <RiAlertLine size={22} />
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label} Urgency
            </span>
            <h3 className="mt-1.5 text-base font-bold text-[var(--text-primary)]">{alert.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{alert.message}</p>
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full bg-[var(--crimson)] px-3 py-1 text-sm font-bold text-white">
          {alert.blood_group}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
        {alert.hospital_name && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-[var(--text-secondary)]">Facility:</span>
            {alert.hospital_name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="font-medium text-[var(--text-secondary)]">Units needed:</span>
          {alert.units_needed}
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium text-[var(--text-secondary)]">Issued:</span>
          {issuedAt}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/60 p-3 dark:bg-black/20">
        <p className="text-sm font-semibold text-[var(--text-primary)]">How you can help</p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          Visit your nearest UBTS donation camp or blood bank. Bring this notification and a valid ID.
          Your <strong>{alert.blood_group}</strong> blood is urgently needed.
        </p>
      </div>
    </div>
  );
}

function BloodDemandAlerts() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const result = await getDonorBloodDemandAlerts();
      setData(result);
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load blood demand alerts." });
    } finally {
      setLoading(false);
    }
  };

  const alerts = data?.alerts ?? [];
  const bg = data?.donor_blood_group;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">Blood Supply</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">Active Blood Demand Alerts</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {bg
              ? `Showing active alerts for your blood group (${bg}) and general appeals.`
              : "Showing all active blood demand alerts."}
          </p>
        </div>
        <Button variant="secondary" onClick={load}><RiRefreshLine /> Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiHeartPulseLine size={32} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">No Active Alerts</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              There are currently no urgent blood demand alerts
              {bg ? ` for ${bg} donors` : ""}. Check back later or keep your profile up to date.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Urgency summary strip */}
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => {
            const count = alerts.filter((a) => a.urgency_level === level).length;
            if (!count) return null;
            const cfg = URGENCY_CFG[level];
            return (
              <div key={level} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${cfg.border} ${cfg.badge}`}>
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                {count} {cfg.label} {count === 1 ? "alert" : "alerts"}
              </div>
            );
          })}

          <div className="space-y-4">
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BloodDemandAlerts;
