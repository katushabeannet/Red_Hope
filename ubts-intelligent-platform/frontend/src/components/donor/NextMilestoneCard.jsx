import { useState } from "react";
import {
  RiBarChartBoxLine,
  RiFlagLine,
  RiInformationLine,
  RiMedalLine,
  RiStarLine,
} from "react-icons/ri";

function getNextLevel(nextMilestone) {
  if (nextMilestone === 5) return "Silver";
  if (nextMilestone === 10) return "Gold";
  if (nextMilestone === 20) return "Platinum";
  return null;
}

const BADGE_NAMES = {
  1: "First Life Saver",
  5: "Regular Donor",
  10: "Community Hero",
  20: "Gold Donor",
};

function NextMilestoneCard({ totalDonations = 0, nextMilestone, nextBadge }) {
  const [showInfo, setShowInfo] = useState(false);

  const safeMilestone = nextMilestone || 5;
  const nextLevel = getNextLevel(safeMilestone) || "Silver";
  const remaining = Math.max(safeMilestone - totalDonations, 0);
  const progress = Math.min((totalDonations / safeMilestone) * 100, 100);
  const completed = totalDonations >= 20 && !nextMilestone;
  const badgeName = nextBadge?.name || BADGE_NAMES[safeMilestone];

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => setShowInfo((prev) => !prev)}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">Next Milestone</p>
          <RiInformationLine
            size={20}
            className="text-[var(--text-muted)] transition group-hover:text-emerald-600"
          />
        </div>

        {!completed && badgeName && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/20">
            <RiMedalLine size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Next: {badgeName}
            </span>
          </div>
        )}

        <h3 className="mt-3 text-3xl font-bold text-emerald-600">
          {completed ? "All Earned!" : `${remaining} more`}
        </h3>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {completed
            ? "Highest donor level achieved."
            : `donation${remaining !== 1 ? "s" : ""} to earn the ${badgeName || nextLevel} badge`}
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${completed ? 100 : progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {completed
            ? `${totalDonations} Donations`
            : `${totalDonations} / ${safeMilestone} (${Math.round(progress)}%)`}
        </p>
      </div>

      {showInfo && (
        <div className="absolute left-0 top-full z-50 mt-4 w-[340px] animate-[fade-pop_0.22s_ease-out] rounded-3xl border border-emerald-400/60 bg-emerald-950 p-5 text-white shadow-2xl shadow-emerald-500/30 dark:border-emerald-300/60 dark:bg-slate-900">
          <div className="absolute left-10 -top-3 h-6 w-6 rotate-45 border-l border-t border-emerald-400/60 bg-emerald-950 dark:bg-slate-900" />

          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-4xl">
              🎯
            </div>

            <div>
              <h4 className="text-xl font-bold text-emerald-300">
                Next Milestone
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Reach the next level and unlock more donor recognition.
              </p>
            </div>
          </div>

          <div className="my-5 border-t border-white/15" />

          <div className="space-y-4 text-sm">
            <InfoLine
              icon={RiFlagLine}
              title="Goal"
              value={
                completed
                  ? "All levels completed"
                  : `${safeMilestone} Donations`
              }
              tone="text-emerald-300"
            />

            <InfoLine
              icon={RiMedalLine}
              title="Next Level"
              value={completed ? "Platinum Achieved" : `${nextLevel} Donor`}
              tone="text-yellow-300"
            />

            <InfoLine
              icon={RiBarChartBoxLine}
              title="Progress"
              value={
                completed
                  ? `${totalDonations} Donations`
                  : `${totalDonations} / ${safeMilestone} Donations (${Math.round(
                      progress
                    )}%)`
              }
              tone="text-green-300"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-emerald-100">
            <RiStarLine className="mr-2 inline text-yellow-300" />
            {completed
              ? "You have reached the highest donor level. UBTS recognizes your outstanding contribution."
              : `You are ${remaining} donation(s) away from reaching ${nextLevel}.`}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoLine({ icon: Icon, title, value, tone }) {
  return (
    <div className="flex gap-3">
      <Icon size={22} className={`mt-1 shrink-0 ${tone}`} />
      <div>
        <p className={`font-bold ${tone}`}>{title}</p>
        <p className="mt-1 text-slate-100">{value}</p>
      </div>
    </div>
  );
}

export default NextMilestoneCard;