import { useState } from "react";
import {
  RiAwardLine,
  RiBarChartBoxLine,
  RiFlagLine,
  RiInformationLine,
  RiMedalLine,
  RiStarLine,
  RiTrophyLine,
} from "react-icons/ri";

const LEVELS = {
  Bronze: {
    min: 0,
    max: 4,
    next: "Silver",
    target: 5,
    color: "amber",
    icon: "🥉",
    description: "Entry level donor beginning your lifesaving journey.",
    benefits: ["Recognized Donor", "Donation Tracking"],
  },
  Silver: {
    min: 5,
    max: 9,
    next: "Gold",
    target: 10,
    color: "slate",
    icon: "🥈",
    description: "Regular donor actively supporting blood donation campaigns.",
    benefits: ["Regular Donor Recognition", "Priority Campaign Invitations"],
  },
  Gold: {
    min: 10,
    max: 19,
    next: "Platinum",
    target: 20,
    color: "yellow",
    icon: "🥇",
    description: "Highly committed donor making a significant impact.",
    benefits: ["Community Hero Badge", "Featured Recognition"],
  },
  Platinum: {
    min: 20,
    max: null,
    next: null,
    target: null,
    color: "emerald",
    icon: "🏆",
    description: "Elite donor recognized for exceptional contribution.",
    benefits: ["Highest Donor Status", "UBTS Hero Recognition"],
  },
};

function DonorLevelCard({ totalDonations = 0, donorLevel = "Bronze" }) {
  const [showInfo, setShowInfo] = useState(false);
  const current = LEVELS[donorLevel] || LEVELS.Bronze;

  const progress = current.target
    ? Math.min((totalDonations / current.target) * 100, 100)
    : 100;

  const remaining = current.target
    ? Math.max(current.target - totalDonations, 0)
    : 0;

  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
      onClick={() => setShowInfo((prev) => !prev)}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">Donor Level</p>
          <RiInformationLine
            size={20}
            className="text-[var(--text-muted)] transition group-hover:text-[var(--crimson)]"
          />
        </div>

        <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
          {donorLevel}
        </h3>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-[var(--crimson)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {current.target
            ? `${totalDonations} / ${current.target} Donations`
            : `${totalDonations} Donations`}
        </p>
      </div>

      {showInfo && (
        <div className="absolute left-0 top-full z-50 mt-4 w-[340px] animate-[fade-pop_0.22s_ease-out] rounded-3xl border border-amber-400/60 bg-slate-950 p-5 text-white shadow-2xl shadow-amber-500/30 dark:border-amber-300/60 dark:bg-slate-900">
          <div className="absolute left-10 -top-3 h-6 w-6 rotate-45 border-l border-t border-amber-400/60 bg-slate-950 dark:bg-slate-900" />

          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-4xl">
              {current.icon}
            </div>

            <div>
              <h4 className="text-xl font-bold text-amber-300">
                {donorLevel} Donor
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {current.description}
              </p>
            </div>
          </div>

          <div className="my-5 border-t border-white/15" />

          <div className="space-y-4 text-sm">
            <InfoLine
              icon={RiFlagLine}
              title="Requirement"
              value={
                current.max === null
                  ? "20+ Donations"
                  : `${current.min} - ${current.max} Donations`
              }
              tone="text-orange-300"
            />

            {current.next && (
              <InfoLine
                icon={RiTrophyLine}
                title="Next Level"
                value={`${current.next} Donor`}
                tone="text-blue-300"
              />
            )}

            <InfoLine
              icon={RiBarChartBoxLine}
              title="Progress"
              value={
                current.target
                  ? `${totalDonations} / ${current.target} Donations (${Math.round(
                      progress
                    )}%)`
                  : `${totalDonations} Donations`
              }
              tone="text-emerald-300"
            />

            <div className="flex gap-3">
              <RiStarLine size={22} className="mt-1 shrink-0 text-purple-300" />
              <div>
                <p className="font-bold text-purple-300">Benefits</p>
                <ul className="mt-1 space-y-1 text-slate-100">
                  {current.benefits.map((benefit) => (
                    <li key={benefit}>✓ {benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-amber-100">
            {current.next
              ? `Keep donating to save more lives. You are ${remaining} donation(s) away from reaching ${current.next}.`
              : "You have achieved the highest donor level. Thank you for your exceptional contribution."}
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

export default DonorLevelCard;