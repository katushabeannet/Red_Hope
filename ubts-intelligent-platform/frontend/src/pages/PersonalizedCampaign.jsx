import { useEffect, useMemo, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiFilter3Line,
  RiMapPinLine,
  RiRefreshLine,
  RiSearchEyeLine,
  RiTimeLine,
} from "react-icons/ri";

import {
  getCampaignCamps,
  scanPersonalizedCampaignDonors,
} from "../services/campaignService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext"; 

const initialFilters = {
  blood_group: "",
  camp_id: "",
  radius_km: 10,
};

const tabs = [
  { key: "matched_donors", label: "All Matched", icon: RiCheckboxCircleLine },
  { key: "available_donors", label: "Available", icon: RiCheckboxCircleLine },
  { key: "unavailable_donors", label: "Unavailable", icon: RiTimeLine },
  { key: "ineligible_donors", label: "Ineligible", icon: RiCloseCircleLine },
  { key: "outside_radius_donors", label: "Outside Radius", icon: RiMapPinLine },
  { key: "skipped_donors", label: "Skipped", icon: RiRefreshLine },
];

function PersonalizedCampaign() {
  const { showToast } = useToast();

  const [filters, setFilters] = useState(initialFilters);
  const [camps, setCamps] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("matched_donors");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campsLoading, setCampsLoading] = useState(false);

  useEffect(() => {
    loadCamps();
  }, []);

  const loadCamps = async () => {
    try {
      setCampsLoading(true);
      const data = await getCampaignCamps();
      setCamps(Array.isArray(data) ? data : data.results || []);
    } catch {
      showToast({
        type: "error",
        title: "Camps Failed",
        message: "Unable to load donation camps.",
      });
    } finally {
      setCampsLoading(false);
    }
  };

  const selectedCamp = camps.find(
    (camp) => String(camp.id) === String(filters.camp_id)
  );

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setResult(null);
    setActiveTab("matched_donors");
    setSelectedDonor(null);
  };

  const handleScan = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        blood_group: filters.blood_group || null,
        campaign_latitude: selectedCamp?.latitude || null,
        campaign_longitude: selectedCamp?.longitude || null,
        radius_km: filters.radius_km || 10,
      };

      const data = await scanPersonalizedCampaignDonors(payload);
      setResult(data);
      setActiveTab("matched_donors");

      showToast({
        type: "success",
        title: "Campaign Scan Completed",
        message: `${data.total_matches} donor(s) fully matched your campaign filters.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Campaign Scan Failed",
        message:
          err.response?.data?.error ||
          "Unable to complete personalized campaign scan.",
      });
    } finally {
      setLoading(false);
    }
  };

const availableDonors = useMemo(() => {
  return result?.matched_donors?.filter((donor) => donor.is_available) || [];
}, [result]);

const unavailableDonors = useMemo(() => {
  return result?.matched_donors?.filter((donor) => !donor.is_available) || [];
}, [result]);

const counts = useMemo(() => {
  if (!result) return {};

  return {
    matched_donors: result.matched_donors?.length || 0,
    available_donors: availableDonors.length,
    unavailable_donors: unavailableDonors.length,
    ineligible_donors: result.ineligible_donors?.length || 0,
    outside_radius_donors: result.outside_radius_donors?.length || 0,
    skipped_donors: result.skipped_donors?.length || 0,
  };
}, [result, availableDonors, unavailableDonors]);

const activeRows = useMemo(() => {
  if (!result) return [];

  if (activeTab === "available_donors") return availableDonors;
  if (activeTab === "unavailable_donors") return unavailableDonors;

  return result?.[activeTab] || [];
}, [result, activeTab, availableDonors, unavailableDonors]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Personalized Campaign Engine
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Target Campaign-Ready Donors
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            Select a donation camp, blood group, and radius. The system scans
            donors and gives a clean summary, while detailed reasons are shown
            only when you open a donor profile.
          </p>
        </div>

        <Button variant="secondary" onClick={handleReset}>
          <RiRefreshLine />
          Reset
        </Button>
      </div>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
            <RiFilter3Line size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Campaign Filters
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Choose a camp instead of manually entering latitude and longitude.
            </p>
          </div>
        </div>

        <form onSubmit={handleScan} className="grid gap-4 md:grid-cols-2">
          <Select
            label="Required Blood Group"
            name="blood_group"
            value={filters.blood_group}
            onChange={handleChange}
            options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            placeholder="All Blood Groups"
          />

          <Select
            label="Donation Camp"
            name="camp_id"
            value={filters.camp_id}
            onChange={handleChange}
            options={camps.map((camp) => ({
              value: camp.id,
              label: `${camp.name} - ${camp.district || camp.venue}`,
            }))}
            placeholder={campsLoading ? "Loading camps..." : "Select Campaign Camp"}
          />

          <Field
            label="Radius KM"
            name="radius_km"
            type="number"
            value={filters.radius_km}
            onChange={handleChange}
            placeholder="10"
          />

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Selected Camp Location
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {selectedCamp
                ? `${selectedCamp.name}, ${selectedCamp.venue || ""} ${
                    selectedCamp.district || ""
                  }`
                : "No camp selected. Location filter will not be applied."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit" loading={loading}>
              <RiSearchEyeLine />
              Run Personalized Scan
            </Button>

            <Button type="button" variant="secondary" onClick={handleReset}>
              Clear Filters
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <>
          <div className="grid gap-5 md:grid-cols-6">
            <SummaryCard label="All Matched" value={counts.matched_donors} />
            <SummaryCard label="Available" value={counts.available_donors} />
            <SummaryCard label="Unavailable" value={counts.unavailable_donors} />
            <SummaryCard label="Ineligible" value={counts.ineligible_donors} />
            <SummaryCard label="Outside Radius" value={counts.outside_radius_donors} />
            <SummaryCard label="Skipped" value={counts.skipped_donors} />
          </div>

          <Card>
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Campaign Scan Summary
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                The table shows a summary only. Click View Details to see full
                eligibility, availability, and exclusion reasons.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    activeTab === key
                      ? "border-[var(--crimson)] bg-[var(--crimson)] text-white"
                      : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === key
                        ? "bg-white/20 text-white"
                        : "bg-white text-[var(--text-secondary)] dark:bg-slate-900"
                    }`}
                  >
                    {counts[key] || 0}
                  </span>
                </button>
              ))}
            </div>

            {activeRows.length > 0 ? (
              <SummaryTable
                rows={activeRows}
                activeTab={activeTab}
                onView={setSelectedDonor}
              />
            ) : (
              <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
                No records found in this section.
              </div>
            )}
          </Card>
        </>
      )}

      {selectedDonor && (
        <DonorDetailsModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}
    </div>
  );
}

function SummaryTable({ rows, activeTab, onView }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
          <tr>
            <th className="p-3 font-medium">Donor</th>
            <th className="p-3 font-medium">Contact</th>
            <th className="p-3 font-medium">Blood Group</th>
            <th className="p-3 font-medium">Distance</th>
            <th className="p-3 font-medium">Summary</th>
            <th className="p-3 font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((donor, index) => (
            <tr
              key={`${donor.donor_id || donor.full_name}-${index}`}
              className="border-t border-[var(--border)]"
            >
              <td className="p-3">
                <p className="font-semibold text-[var(--text-primary)]">
                  {donor.full_name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {donor.email || "No email"}
                </p>
              </td>

              <td className="p-3 text-[var(--text-secondary)]">
                {donor.phone_number || "Not available"}
              </td>

              <td className="p-3">
                {donor.blood_group ? (
                  <Badge label={donor.blood_group} variant="donor" />
                ) : (
                  "N/A"
                )}
              </td>

              <td className="p-3 text-[var(--text-secondary)]">
                {donor.distance_km !== null && donor.distance_km !== undefined
                  ? `${donor.distance_km} km`
                  : "Not filtered"}
              </td>

              <td className="p-3 text-[var(--text-secondary)]">
                {getShortReason(donor, activeTab)}
              </td>

              <td className="p-3">
                <Button size="sm" variant="secondary" onClick={() => onView(donor)}>
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DonorDetailsModal({ donor, onClose }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {donor.full_name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {donor.email || "No email"} • {donor.phone_number || "No phone"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <DetailBox label="Blood Group" value={donor.blood_group} />
            <DetailBox
              label="Distance"
              value={
                donor.distance_km !== null && donor.distance_km !== undefined
                  ? `${donor.distance_km} km`
                  : "Not filtered"
              }
            />
            <DetailBox
              label="Donations"
              value={donor.total_donations ?? "Not recorded"}
            />
          </div>

          <DetailSection
            title="Eligibility"
            status={donor.is_eligible ? "Eligible" : "Not Eligible"}
            summary={donor.eligibility_summary}
            reasons={donor.eligibility_reasons}
          />

          <DetailSection
            title="Availability"
            status={donor.is_available ? "Available" : "Not Available"}
            summary={donor.availability_summary}
            reasons={donor.availability_reasons}
          />

          {donor.exclusion_reason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <p className="font-semibold">Exclusion Reason</p>
              <p className="mt-2 text-sm">{donor.exclusion_reason}</p>
            </div>
          )}

          {donor.reason && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <p className="font-semibold">Skipped Reason</p>
              <p className="mt-2 text-sm">{donor.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, status, summary, reasons }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-[var(--text-primary)]">{title}</h4>
        <Badge
          label={status}
          variant={status.includes("Not") ? "ineligible" : "eligible"}
        />
      </div>

      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        {summary || "No summary available."}
      </p>

      {reasons?.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
          {reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--text-primary)]">
        {value || "N/A"}
      </p>
    </div>
  );
}

function getShortReason(donor, tab) {
  if (tab === "matched_donors") return "Eligible donor included in campaign ranking";
  if (tab === "available_donors") return "Available and ready for campaign targeting";
  if (tab === "unavailable_donors") return "Eligible but has low predicted availability";
  if (tab === "ineligible_donors") return "Failed eligibility rules";
  if (tab === "outside_radius_donors") return "Outside selected campaign radius";
  if (tab === "skipped_donors") return donor.reason || "Missing required data";
  return donor.match_status || "Reviewed";
}

function SummaryCard({ label, value }) {
  return (
    <Card>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {value}
      </h3>
    </Card>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select option",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      >
        <option value="">{placeholder}</option>

        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option || "all"} value={option}>
              {option || placeholder}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

export default PersonalizedCampaign;