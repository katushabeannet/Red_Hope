import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getRecentAssessments,
  getCampStatistics,
  getCampaignReadyDonors,
} from "../services/adminService";

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
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-slate-600">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Monitor donors, assessments, donation camps, and campaign-ready donor
          intelligence.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Total Donors</p>
            <h3 className="mt-2 text-3xl font-bold text-red-700">
              {summary.total_donors}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Medical Records</p>
            <h3 className="mt-2 text-3xl font-bold text-red-700">
              {summary.total_medical_records}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Active Camps</p>
            <h3 className="mt-2 text-3xl font-bold text-red-700">
              {summary.active_camps}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Total Camps</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-800">
              {summary.total_camps}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Eligible Assessments</p>
            <h3 className="mt-2 text-3xl font-bold text-green-700">
              {summary.eligible_assessments}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Available Assessments</p>
            <h3 className="mt-2 text-3xl font-bold text-green-700">
              {summary.available_assessments}
            </h3>
          </div>
        </section>
      )}

      {campStats && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Camp Statistics
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Inactive Camps</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {campStats.inactive_camps}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Completed Camps</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {campStats.completed_camps}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Camps</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {campStats.total_camps}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Campaign-Ready Donor Scan
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Scan donors who are both eligible and likely available for a
              campaign.
            </p>
          </div>

          <button
            onClick={handleCampaignReadyScan}
            disabled={scanLoading}
            className="rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800 disabled:bg-red-400"
          >
            {scanLoading ? "Scanning..." : "Run Scan"}
          </button>
        </div>

        {readyDonors && (
          <div className="mt-6">
            <p className="mb-3 font-medium text-slate-800">
              Total Ready Donors: {readyDonors.total_ready_donors}
            </p>

            {readyDonors.ready_donors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Blood Group</th>
                      <th className="p-3">Availability</th>
                    </tr>
                  </thead>

                  <tbody>
                    {readyDonors.ready_donors.map((donor) => (
                      <tr key={donor.donor_id} className="border-b">
                        <td className="p-3">{donor.full_name}</td>
                        <td className="p-3">{donor.email}</td>
                        <td className="p-3">{donor.phone_number}</td>
                        <td className="p-3 font-semibold">
                          {donor.blood_group}
                        </td>
                        <td className="p-3">
                          {donor.availability_probability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No campaign-ready donors found yet.
              </p>
            )}
          </div>
        )}
      </section>

      {recentAssessments && (
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Eligibility Assessments
            </h3>

            {recentAssessments.recent_eligibility.length > 0 ? (
              <div className="space-y-3">
                {recentAssessments.recent_eligibility.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-800">{item.donor}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                    <p className="mt-1 text-sm">
                      Eligible: {item.is_eligible ? "Yes" : "No"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No eligibility assessments yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Recent Availability Assessments
            </h3>

            {recentAssessments.recent_availability.length > 0 ? (
              <div className="space-y-3">
                {recentAssessments.recent_availability.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-800">{item.donor}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                    <p className="mt-1 text-sm">
                      Available: {item.is_available ? "Yes" : "No"}
                    </p>
                    <p className="text-sm">
                      Probability: {item.availability_probability}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No availability assessments yet.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;