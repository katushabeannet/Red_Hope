import { useEffect, useState } from "react";
import {
  RiAlertLine,
  RiHeartPulseLine,
  RiRefreshLine,
} from "react-icons/ri";

import { getDonorBloodDemandAlerts } from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";
import AdminLoader from "../../components/common/AdminLoader";

const URGENCY_CFG = {
  CRITICAL: { color: "var(--cr)",      bg: "#FFF5F5", iconBg: "#FDEEF1", badge: "badge-red",   label: "CRITICAL" },
  HIGH:     { color: "#f97316",         bg: "#FFF7ED", iconBg: "#FFEDD5", badge: "badge-red",   label: "HIGH"     },
  MEDIUM:   { color: "var(--amber)",    bg: "#FFFBEB", iconBg: "#FEF3C7", badge: "badge-amber", label: "MEDIUM"   },
  LOW:      { color: "#94a3b8",         bg: "#F8FAFC", iconBg: "#F1F5F9", badge: "badge-gray",  label: "LOW"      },
};

const STAT_ICONS = {
  CRITICAL: "cr",
  HIGH:     "am",
  MEDIUM:   "am",
  LOW:      "gr",
};

function BloodDemandAlerts() {
  const { showToast } = useToast();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setData(await getDonorBloodDemandAlerts());
    } catch {
      showToast({ type: "error", title: "Load Failed", message: "Could not load blood demand alerts." });
    } finally {
      setLoading(false);
    }
  };

  const alerts = data?.alerts ?? [];
  const bg     = data?.donor_blood_group;

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Blood Supply</div>
          <h1 className="page-title rh-display">Blood Demand Alerts</h1>
          <p className="page-desc">
            {bg
              ? `Showing active alerts for your blood group (${bg}) and general appeals.`
              : "Showing all active blood demand alerts."}
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          <RiRefreshLine /> Refresh
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && <AdminLoader text="Loading alerts…" />}

      {/* ── Urgency summary cards ── */}
      {!loading && alerts.length > 0 && (
        <div className="stat-grid">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => {
            const count = alerts.filter((a) => a.urgency_level === level).length;
            if (!count) return null;
            const cfg = URGENCY_CFG[level];
            return (
              <div key={level} className="stat-card">
                <div className={`stat-icon ${STAT_ICONS[level]}`}><RiAlertLine size={18} /></div>
                <div className="stat-body">
                  <div className="stat-val">{count}</div>
                  <div className="stat-label">{cfg.label} {count === 1 ? "Alert" : "Alerts"}</div>
                </div>
              </div>
            );
          })}
          {bg && (
            <div className="stat-card">
              <div className="stat-icon cr"><RiHeartPulseLine size={18} /></div>
              <div className="stat-body">
                <div className="stat-val" style={{ fontSize: 18, fontWeight: 800 }}>{bg}</div>
                <div className="stat-label">Your Blood Group</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && alerts.length === 0 && (
        <div className="panel">
          <div className="panel-body">
            <div className="empty-state">
              <RiHeartPulseLine size={36} />
              <p>No Active Alerts</p>
              <span>
                There are currently no urgent blood demand alerts
                {bg ? ` for ${bg} donors` : ""}. Check back later or keep your profile up to date.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert cards ── */}
      {!loading && alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} donorBg={bg} />
          ))}
        </div>
      )}
    </>
  );
}

function AlertCard({ alert, donorBg }) {
  const cfg = URGENCY_CFG[alert.urgency_level] ?? URGENCY_CFG.HIGH;
  const isMyType = donorBg && alert.blood_group === donorBg;

  return (
    <div className="panel" style={{ borderLeft: `4px solid ${cfg.color}`, background: cfg.bg, padding: 0 }}>
      <div style={{ padding: "20px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: cfg.iconBg, color: cfg.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <RiAlertLine size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span className={`badge ${cfg.badge}`}>{cfg.label} URGENCY</span>
                {isMyType && (
                  <span style={{
                    background: "rgba(185,28,44,.12)", color: "var(--cr)",
                    borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                  }}>
                    Matches Your Blood Group
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: "0 0 6px", lineHeight: 1.3 }}>
                {alert.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.6, margin: 0 }}>
                {alert.message}
              </p>
            </div>
          </div>
          <span className="badge badge-red" style={{ fontSize: 15, padding: "5px 16px", fontWeight: 800, flexShrink: 0 }}>
            {alert.blood_group}
          </span>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 16,
          paddingTop: 12, borderTop: "1px solid rgba(0,0,0,.06)",
          fontSize: 12, color: "var(--ink-l)",
        }}>
          {alert.hospital_name && (
            <span>
              <strong style={{ color: "var(--ink-s)" }}>Facility: </strong>
              {alert.hospital_name}
            </span>
          )}
          <span>
            <strong style={{ color: "var(--ink-s)" }}>Units needed: </strong>
            {alert.units_needed}
          </span>
          <span>
            <strong style={{ color: "var(--ink-s)" }}>Issued: </strong>
            {new Date(alert.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* CTA strip */}
      <div style={{
        margin: "0 24px 20px",
        borderRadius: 12,
        background: "rgba(255,255,255,.75)",
        padding: "14px 16px",
        backdropFilter: "blur(8px)",
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>
          How you can help
        </p>
        <p style={{ fontSize: 12, color: "var(--ink-s)", margin: 0, lineHeight: 1.6 }}>
          Visit your nearest UBTS donation camp or blood bank. Bring this notification and a valid ID.
          Your <strong style={{ color: cfg.color }}>{alert.blood_group}</strong> blood is urgently needed.
        </p>
      </div>
    </div>
  );
}

export default BloodDemandAlerts;
