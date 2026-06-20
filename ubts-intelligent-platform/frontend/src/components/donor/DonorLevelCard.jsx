import { useState } from "react";
import {
  RiBarChartBoxLine,
  RiFlagLine,
  RiInformationLine,
  RiStarLine,
  RiTrophyLine,
} from "react-icons/ri";

const LEVELS = {
  Bronze:   { min: 0,  max: 4,    next: "Silver",   target: 5,    icon: "🥉", description: "Entry level donor beginning your lifesaving journey.",                  benefits: ["Recognized Donor", "Donation Tracking"] },
  Silver:   { min: 5,  max: 9,    next: "Gold",     target: 10,   icon: "🥈", description: "Regular donor actively supporting blood donation campaigns.",             benefits: ["Regular Donor Recognition", "Priority Campaign Invitations"] },
  Gold:     { min: 10, max: 19,   next: "Platinum", target: 20,   icon: "🥇", description: "Highly committed donor making a significant impact.",                     benefits: ["Community Hero Badge", "Featured Recognition"] },
  Platinum: { min: 20, max: null, next: null,       target: null, icon: "🏆", description: "Elite donor recognized for exceptional contribution.",                    benefits: ["Highest Donor Status", "UBTS Hero Recognition"] },
};

const LEVEL_COLOR = {
  Bronze:   "#d97706",
  Silver:   "#64748b",
  Gold:     "#ca8a04",
  Platinum: "#059669",
};

function DonorLevelCard({ totalDonations = 0, donorLevel = "Bronze" }) {
  const [showInfo, setShowInfo] = useState(false);
  const current   = LEVELS[donorLevel] || LEVELS.Bronze;
  const accent    = LEVEL_COLOR[donorLevel] || LEVEL_COLOR.Bronze;
  const progress  = current.target ? Math.min((totalDonations / current.target) * 100, 100) : 100;
  const remaining = current.target ? Math.max(current.target - totalDonations, 0) : 0;

  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => setShowInfo((v) => !v)}
    >
      {/* Main card */}
      <div style={{
        borderRadius: 16, border: "1.5px solid var(--border)", background: "#fff",
        padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.04)",
        transition: "transform .2s, box-shadow .2s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.09)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: "var(--ink-l)", margin: 0 }}>Donor Level</p>
          <RiInformationLine size={18} style={{ color: "var(--ink-l)", transition: "color .2s" }} />
        </div>

        <h3 style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", margin: "0 0 18px", lineHeight: 1 }}>
          {donorLevel}
        </h3>

        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden", marginBottom: 10 }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
            width: `${progress}%`,
            transition: "width .7s ease",
          }} />
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-s)", margin: 0 }}>
          {current.target
            ? `${totalDonations} / ${current.target} Donations`
            : `${totalDonations} Donations — Highest Level`}
        </p>
      </div>

      {/* Hover popup */}
      {showInfo && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", left: 0, zIndex: 100,
          width: 340, background: "#0f172a", borderRadius: 20, padding: 20,
          border: `1px solid ${accent}55`,
          boxShadow: `0 20px 60px rgba(0,0,0,.35), 0 0 0 1px ${accent}33`,
          color: "#fff", animation: "fadeSlideUp .2s ease",
        }}>
          {/* Caret */}
          <div style={{
            position: "absolute", top: -10, left: 32,
            width: 20, height: 20, background: "#0f172a",
            border: `1px solid ${accent}55`, borderRight: "none", borderBottom: "none",
            transform: "rotate(45deg)",
          }} />

          {/* Level header */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14, flexShrink: 0,
              background: `${accent}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
            }}>
              {current.icon}
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: accent, margin: "0 0 6px" }}>
                {donorLevel} Donor
              </h4>
              <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                {current.description}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", margin: "14px 0" }} />

          {/* Info lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PopupLine icon={RiFlagLine} color="#fb923c" title="Requirement"
              value={current.max === null ? "20+ Donations" : `${current.min} – ${current.max} Donations`}
            />
            {current.next && (
              <PopupLine icon={RiTrophyLine} color="#60a5fa" title="Next Level"
                value={`${current.next} Donor`}
              />
            )}
            <PopupLine icon={RiBarChartBoxLine} color="#34d399" title="Progress"
              value={current.target
                ? `${totalDonations} / ${current.target} (${Math.round(progress)}%)`
                : `${totalDonations} Donations`}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <RiStarLine size={20} style={{ color: "#a78bfa", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, color: "#a78bfa", fontSize: 13, margin: "0 0 4px" }}>Benefits</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 3 }}>
                  {current.benefits.map((b) => (
                    <li key={b} style={{ fontSize: 12, color: "#f1f5f9" }}>✓ {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 16, borderRadius: 14,
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.07)",
            padding: "12px 14px", fontSize: 12, color: "#fde68a", lineHeight: 1.6,
          }}>
            {current.next
              ? `Keep donating to save more lives. You are ${remaining} donation(s) away from reaching ${current.next}.`
              : "You have achieved the highest donor level. Thank you for your exceptional contribution."}
          </div>
        </div>
      )}
    </div>
  );
}

function PopupLine({ icon: Icon, color, title, value }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Icon size={20} style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div>
        <p style={{ fontWeight: 700, color, fontSize: 12, margin: "0 0 2px" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#f1f5f9", margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

export default DonorLevelCard;
