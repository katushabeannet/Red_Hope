import { useEffect, useState } from "react";
import {
  RiCalendarCheckLine,
  RiDashboardLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiMapPinLine,
  RiRefreshLine,
  RiShieldCheckLine,
} from "react-icons/ri";

import {
  getDashboardSummary,
  getRecentAssessments,
  getCampStatistics,
  getCampaignReadyDonors,
} from "../services/adminService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState(null);
  const [campStats, setCampStats] = useState(null);
  const [readyDonors, setReadyDonors] = useState(null);

  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setError("");
      setLoading(true);

      const [summaryData, assessmentsData, campData] = await Promise.all([
        getDashboardSummary(),
        getRecentAssessments(),
        getCampStatistics(),
      ]);

      setSummary(summaryData);
      setRecentAssessments(assessmentsData);
      setCampStats(campData);
    } catch {
      setError("Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignReadyScan = async () => {
    try {
      setError("");
      setScanLoading(true);

      const data = await getCampaignReadyDonors();
      setReadyDonors(data);
    } catch {
      setError("Failed to scan campaign-ready donors.");
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--crimson)] border-t-transparent" />
        <p className="text-sm text-[var(--text-secondary)]">
          Loading admin intelligence dashboard...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Admin Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Monitor donor records, assessment activity, donation camps, and
            campaign-ready donor intelligence.
          </p>
        </div>

        <Button variant="secondary" onClick={loadAdminData}>
          <RiRefreshLine />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </Card>
      )}

      {summary && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            icon={RiGroupLine}
            label="Total Donors"
            value={summary.total_donors}
            tone="red"
          />
          <MetricCard
            icon={RiHeartPulseLine}
            label="Medical Records"
            value={summary.total_medical_records}
            tone="emerald"
          />
          <MetricCard
            icon={RiMapPinLine}
            label="Active Camps"
            value={summary.active_camps}
            tone="blue"
          />
          <MetricCard
            icon={RiCalendarCheckLine}
            label="Total Camps"
            value={summary.total_camps}
            tone="amber"
          />
          <MetricCard
            icon={RiShieldCheckLine}
            label="Eligible Assessments"
            value={summary.eligible_assessments}
            tone="emerald"
          />
          <MetricCard
            icon={RiDashboardLine}
            label="Available Assessments"
            value={summary.available_assessments}
            tone="blue"
          />
        </div>
      )}

      {campStats && (
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Camp Statistics
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Summary of donation camp statuses.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatusBox label="Active" value={campStats.active_camps} variant="active" />
            <StatusBox
              label="Inactive"
              value={campStats.inactive_camps}
              variant="inactive"
            />
            <StatusBox
              label="Completed"
              value={campStats.completed_camps}
              variant="completed"
            />
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Campaign-Ready Donor Scan
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Find donors who are both eligible and likely available for a blood
              donation campaign.
            </p>
          </div>

          <Button onClick={handleCampaignReadyScan} loading={scanLoading}>
            <RiShieldCheckLine />
            Run Intelligent Scan
          </Button>
        </div>

        {readyDonors && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Total Ready Donors: {readyDonors.total_ready_donors}
              </p>
              <Badge label="Verified scan" variant="eligible" />
            </div>

            {readyDonors.ready_donors.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Phone</th>
                      <th className="p-3 font-medium">Blood Group</th>
                      <th className="p-3 font-medium">Availability</th>
                    </tr>
                  </thead>

                  <tbody>
                    {readyDonors.ready_donors.map((donor) => (
                      <tr
                        key={donor.donor_id}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="p-3 font-medium text-[var(--text-primary)]">
                          {donor.full_name}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {donor.email}
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {donor.phone_number}
                        </td>
                        <td className="p-3">
                          <Badge label={donor.blood_group} variant="donor" />
                        </td>
                        <td className="p-3 text-[var(--text-secondary)]">
                          {donor.availability_probability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
                No campaign-ready donors found yet.
              </p>
            )}
          </div>
        )}
      </Card>

      {recentAssessments && (
        <section className="grid gap-6 lg:grid-cols-2">
          <AssessmentList
            title="Recent Eligibility Assessments"
            items={recentAssessments.recent_eligibility}
            type="eligibility"
          />

          <AssessmentList
            title="Recent Availability Assessments"
            items={recentAssessments.recent_availability}
            type="availability"
          />
        </section>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    red: "bg-red-50 text-red-600 dark:bg-red-900/20",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  };

  return (
    <Card>
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          tones[tone] || tones.red
        }`}
      >
        <Icon size={22} />
      </div>

      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
    </Card>
  );
}

function StatusBox({ label, value, variant }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <Badge label={label} variant={variant} />
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function AssessmentList({ title, items, type }) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {items?.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isPositive =
              type === "eligibility" ? item.is_eligible : item.is_available;

            return (
              <div
                key={index}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {item.donor || "Unknown donor"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.email}
                    </p>
                  </div>

                  <Badge
                    label={isPositive ? "Positive" : "Negative"}
                    variant={isPositive ? "eligible" : "ineligible"}
                  />
                </div>

                {type === "availability" && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Probability: {item.availability_probability}
                  </p>
                )}

                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                  {item.summary}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
          No records found.
        </p>
      )}
    </Card>
  );
}

export default AdminDashboard;