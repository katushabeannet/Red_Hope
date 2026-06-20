import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  RiBarChartBoxLine,
  RiFlagLine,
  RiInformationLine,
  RiMedalLine,
  RiStarLine,
} from "react-icons/ri";

const MILESTONE_LEVELS = { 5: "Silver", 10: "Gold", 20: "Platinum" };
const BADGE_NAMES      = { 1: "First Life Saver", 5: "Regular Donor", 10: "Community Hero", 20: "Gold Donor" };

function NextMilestoneCard({ totalDonations = 0, nextMilestone, nextBadge }) {
  const { dark } = useTheme();
  const [showInfo, setShowInfo] = useState(false);

  const safeMilestone = nextMilestone || 5;
  const nextLevel     = MILESTONE_LEVELS[safeMilestone] || "Silver";
  const remaining     = Math.max(safeMilestone - totalDonations, 0);
  const progress      = Math.min((totalDonations / safeMilestone) * 100, 100);
  const completed     = totalDonations >= 20 && !nextMilestone;
  const badgeName     = nextBadge?.name || BADGE_NAMES[safeMilestone];

  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => setShowInfo((v) => !v)}
    >
      {/* Main card */}
      <div style={{
        borderRadius: 16, border: "1.5px solid var(--border)", background: dark ? "#1E293B" : "#fff",
        padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,.04)",
        transition: "transform .2s, box-shadow .2s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.09)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: "var(--ink-l)", margin: 0 }}>Next Milestone</p>
          <RiInformationLine size={18} style={{ color: "var(--ink-l)" }} />
        </div>

        {!completed && badgeName && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: dark ? "rgba(22,163,74,.18)" : "#F0FDF4", borderRadius: 999, padding: "4px 12px",
            marginBottom: 8,
          }}>
            <RiMedalLine size={12} style={{ color: "var(--green)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>
              Next: {badgeName}
            </span>
          </div>
        )}

        <h3 style={{ fontSize: 28, fontWeight: 800, color: "var(--green)", margin: "0 0 4px", lineHeight: 1 }}>
          {completed ? "All Earned!" : `${remaining} more`}
        </h3>
        <p style={{ fontSize: 12, color: "var(--ink-s)", margin: "0 0 16px", lineHeight: 1.5 }}>
          {completed
            ? "Highest donor level achieved."
            : `donation${remaining !== 1 ? "s" : ""} to earn the ${badgeName || nextLevel} badge`}
        </p>

        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 999, background: dark ? "#334155" : "#e2e8f0", overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg, var(--green), #4ade80)",
            width: `${completed ? 100 : progress}%`,
            transition: "width .7s ease",
          }} />
        </div>

        <p style={{ fontSize: 11, color: "var(--ink-l)", margin: 0 }}>
          {completed
            ? `${totalDonations} Donations`
            : `${totalDonations} / ${safeMilestone} (${Math.round(progress)}%)`}
        </p>
      </div>

      {/* Hover popup */}
      {showInfo && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", left: 0, zIndex: 100,
          width: 340, background: "#052e16", borderRadius: 20, padding: 20,
          border: "1px solid rgba(52,211,153,.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,.35), 0 0 0 1px rgba(52,211,153,.15)",
          color: "#fff", animation: "fadeSlideUp .2s ease",
        }}>
          {/* Caret */}
          <div style={{
            position: "absolute", top: -10, left: 32,
            width: 20, height: 20, background: "#052e16",
            border: "1px solid rgba(52,211,153,.3)", borderRight: "none", borderBottom: "none",
            transform: "rotate(45deg)",
          }} />

          {/* Header */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14, flexShrink: 0,
              background: "rgba(52,211,153,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
            }}>
              🎯
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: "#6ee7b7", margin: "0 0 6px" }}>
                Next Milestone
              </h4>
              <p style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                Reach the next level and unlock more donor recognition.
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", margin: "14px 0" }} />

          {/* Info lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <PopupLine icon={RiFlagLine} color="#6ee7b7" title="Goal"
              value={completed ? "All levels completed" : `${safeMilestone} Donations`}
            />
            <PopupLine icon={RiMedalLine} color="#fde68a" title="Next Level"
              value={completed ? "Platinum Achieved" : `${nextLevel} Donor`}
            />
            <PopupLine icon={RiBarChartBoxLine} color="#86efac" title="Progress"
              value={completed
                ? `${totalDonations} Donations`
                : `${totalDonations} / ${safeMilestone} (${Math.round(progress)}%)`}
            />
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 16, borderRadius: 14,
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.07)",
            padding: "12px 14px", fontSize: 12, color: "#a7f3d0", lineHeight: 1.6,
          }}>
            <RiStarLine style={{ display: "inline", marginRight: 6, color: "#fde68a" }} />
            {completed
              ? "You have reached the highest donor level. UBTS recognizes your outstanding contribution."
              : `You are ${remaining} donation(s) away from reaching ${nextLevel}.`}
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

export default NextMilestoneCard;
