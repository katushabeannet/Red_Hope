import { useEffect, useState } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiAwardLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiDownloadLine,
  RiDropLine,
  RiHeartPulseLine,
  RiHistoryLine,
  RiMapPinLine,
  RiNotification3Line,
  RiShieldCheckLine,
  RiUserHeartLine,
} from "react-icons/ri";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  getDonorProfile,
  getDonorMedicalRecord,
  getDonorImpact,
  getDonorRetentionSummary,
  checkEligibility,
  checkAvailability,
  findNearestCamp,
  getDonorAssessmentHistory,
  getDonationHistory,
  downloadCertificate,
  getActiveCamps,
} from "../services/donorService";

const calLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import NearestCampMap from "../components/NearestCampMap";
import DonorLevelCard from "../components/donor/DonorLevelCard";
import NextMilestoneCard from "../components/donor/NextMilestoneCard";

function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [impact, setImpact] = useState(null);
  const [retention, setRetention] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);

  const [history, setHistory] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyVisible, setHistoryVisible] = useState(false);

  const [donations, setDonations] = useState(null);
  const [donationPage, setDonationPage] = useState(1);
  const [donationsVisible, setDonationsVisible] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [campCalendarVisible, setCampCalendarVisible] = useState(false);
  const [campEvents, setCampEvents] = useState([]);
  const [campsLoading, setCampsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDonorData();
  }, []);

  const loadDonorData = async () => {
    try {
      setError("");

      const profileData = await getDonorProfile();
      setProfile(profileData);

      try {
        const medicalData = await getDonorMedicalRecord();
        setMedicalRecord(medicalData);
      } catch (err) {
        if (err.response?.status === 404) {
          setMedicalRecord(null);
        } else {
          throw err;
        }
      }

      try {
        const impactData = await getDonorImpact();
        setImpact(impactData);
      } catch {
        setImpact(null);
      }

      try {
        const retentionData = await getDonorRetentionSummary();
        setRetention(retentionData);
      } catch {
        setRetention(null);
      }
    } catch {
      setError("Failed to load donor dashboard information.");
    }
  };

  const handleEligibilityCheck = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await checkEligibility();
      setEligibilityResult(data);
    } catch {
      setError(
        "Eligibility check failed. UBTS may need to add your medical record first."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityCheck = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await checkAvailability();
      setAvailabilityResult(data);
    } catch {
      setError(
        "Availability check failed. UBTS may need to add your medical record first."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const data = await getDonorAssessmentHistory({ page, page_size: 5 });
      setHistory(data);
      setHistoryPage(page);
      setHistoryVisible(true);
    } catch {
      setError("Failed to load assessment history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLoadDonations = async (page = 1) => {
    try {
      setDonationsLoading(true);
      const data = await getDonationHistory({ page, page_size: 5 });
      setDonations(data);
      setDonationPage(page);
      setDonationsVisible(true);
    } catch {
      setError("Failed to load donation history.");
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleDownloadCertificate = async (donationId) => {
    try {
      setDownloadingId(donationId);
      await downloadCertificate(donationId);
    } catch {
      setError("Could not generate certificate. Ensure reportlab is installed on the server.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLoadCampCalendar = async () => {
    if (campCalendarVisible) {
      setCampCalendarVisible(false);
      return;
    }
    try {
      setCampsLoading(true);
      const camps = await getActiveCamps();
      setCampEvents(
        (camps || [])
          .filter((c) => c.start_date && c.end_date)
          .map((c) => ({
            id: c.id,
            title: c.name,
            start: new Date(c.start_date),
            end: new Date(c.end_date),
            resource: c,
          }))
      );
      setCampCalendarVisible(true);
    } catch {
      setError("Failed to load camp calendar.");
    } finally {
      setCampsLoading(false);
    }
  };

  const handleNearestCamp = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCamp({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setNearestCamp(data);
        } catch {
          setError("Failed to find nearest donation camp.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setError("Location access was denied.");
        setLocationLoading(false);
      }
    );
  };

  const eligibilityAssessment = eligibilityResult?.assessment;
  const availabilityAssessment = availabilityResult?.assessment;
  const camp = nearestCamp?.nearest_camp;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Donor Workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Welcome, {profile?.full_name || "Donor"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Track your donation impact, receive readiness reminders, check
            donor status, and locate nearby blood donation camps.
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--crimson)] px-6 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-red-100">
            Donor Level
          </p>
          <p className="text-2xl font-bold">
            {impact?.donor_level || "Bronze"}
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </Card>
      )}

      {!medicalRecord && (
        <Card className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <h3 className="font-semibold">Medical information not yet available</h3>
          <p className="mt-2 text-sm leading-6">
            Your medical information will be filled by UBTS staff after your
            donation or medical screening. Eligibility, availability, and
            donation reminders will become active once this information is
            recorded.
          </p>
        </Card>
      )}

      {retention && (
        <RetentionReminderCard
          retention={retention}
          onFindCamp={handleNearestCamp}
          locationLoading={locationLoading}
        />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ImpactCard
          icon={RiUserHeartLine}
          label="Total Donations"
          value={impact?.total_donations ?? 0}
          text="Completed donations"
        />

        <ImpactCard
          icon={RiHeartPulseLine}
          label="Lives Saved"
          value={impact?.estimated_lives_saved ?? 0}
          text="Estimated impact"
        />

        <DonorLevelCard
          donorLevel={impact?.donor_level || "Bronze"}
          totalDonations={impact?.total_donations || 0}
        />

        <NextMilestoneCard
          totalDonations={impact?.total_donations || 0}
          nextMilestone={impact?.next_milestone}
          nextBadge={impact?.next_badge}
        />
      </div>

      {impact?.badges?.length > 0 && (
        <Card>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Achievement Badges
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Recognition earned from your donation journey.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {impact.badges.map((badge, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                  <RiAwardLine size={22} />
                </div>

                <h4 className="font-semibold text-[var(--text-primary)]">
                  {badge.badge_name}
                </h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {badge.badge_description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
            <RiUserHeartLine size={22} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Donor Status</p>
          <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
            {medicalRecord ? "Profile Ready" : "Awaiting Medical Record"}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {medicalRecord
              ? "Your UBTS medical details are recorded."
              : "UBTS staff will record your medical details after screening."}
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
            <RiHeartPulseLine size={22} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Medical Readiness</p>
          <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
            {medicalRecord ? "Recorded by UBTS" : "Pending UBTS Entry"}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Hemoglobin: {medicalRecord?.hemoglobin_level || "Not recorded"}
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
            <RiMapPinLine size={22} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Location Services</p>
          <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
            Nearest Camp Finder
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Uses browser location and Haversine distance.
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Donor Intelligence Tools
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Eligibility and availability checks require UBTS medical
              information. Camp recommendations can be used anytime.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleEligibilityCheck}
              loading={loading}
              disabled={!medicalRecord}
            >
              <RiShieldCheckLine />
              Check Eligibility
            </Button>

            <Button
              variant="secondary"
              onClick={handleAvailabilityCheck}
              loading={loading}
              disabled={!medicalRecord}
            >
              <RiHeartPulseLine />
              Check Availability
            </Button>

            <Button
              variant="outline"
              onClick={handleNearestCamp}
              loading={locationLoading}
            >
              <RiMapPinLine />
              Find Nearest Camp
            </Button>

            <Button
              variant="outline"
              onClick={() => historyVisible ? setHistoryVisible(false) : handleLoadHistory(1)}
              loading={historyLoading}
            >
              <RiHistoryLine />
              {historyVisible ? "Hide History" : "Assessment History"}
            </Button>

            <Button
              variant="outline"
              onClick={() => donationsVisible ? setDonationsVisible(false) : handleLoadDonations(1)}
              loading={donationsLoading}
            >
              <RiDropLine />
              {donationsVisible ? "Hide Donations" : "My Donations"}
            </Button>

            <Button
              variant="outline"
              onClick={handleLoadCampCalendar}
              loading={campsLoading}
            >
              <RiCalendarLine />
              {campCalendarVisible ? "Hide Calendar" : "Camp Calendar"}
            </Button>
          </div>
        </div>
      </Card>

      {eligibilityResult && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Eligibility Result
            </h3>
            <Badge
              label={
                eligibilityAssessment?.is_eligible ? "Eligible" : "Not Eligible"
              }
              variant={
                eligibilityAssessment?.is_eligible ? "eligible" : "ineligible"
              }
            />
          </div>

          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {eligibilityResult.assistant_response}
          </p>
        </Card>
      )}

      {availabilityResult && (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Availability Result
            </h3>
            <Badge
              label={
                availabilityAssessment?.is_available
                  ? "Likely Available"
                  : "Not Available"
              }
              variant={
                availabilityAssessment?.is_available ? "eligible" : "ineligible"
              }
            />
          </div>

          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {availabilityResult.assistant_response}
          </p>
        </Card>
      )}

      {historyVisible && history && (
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiHistoryLine size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Assessment History</h3>
              <p className="text-sm text-[var(--text-secondary)]">Your past eligibility and availability checks.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-[var(--text-primary)]">
                Eligibility ({history.eligibility_total} total)
              </h4>
              {history.eligibility_history?.length > 0 ? (
                <div className="space-y-2">
                  {history.eligibility_history.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(item.assessed_at).toLocaleDateString()}
                        </span>
                        <Badge
                          label={item.is_eligible ? "Eligible" : "Not Eligible"}
                          variant={item.is_eligible ? "eligible" : "ineligible"}
                        />
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">{item.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No eligibility assessments yet.</p>
              )}
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-[var(--text-primary)]">
                Availability ({history.availability_total} total)
              </h4>
              {history.availability_history?.length > 0 ? (
                <div className="space-y-2">
                  {history.availability_history.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(item.assessed_at).toLocaleDateString()}
                        </span>
                        <Badge
                          label={item.is_available ? "Available" : "Not Available"}
                          variant={item.is_available ? "eligible" : "ineligible"}
                        />
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Probability: {Math.round((item.availability_probability || 0) * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No availability assessments yet.</p>
              )}
            </div>
          </div>

          {(history.eligibility_total_pages > 1 || history.availability_total_pages > 1) && (
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-sm text-[var(--text-secondary)]">Page {historyPage}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={historyPage <= 1} onClick={() => handleLoadHistory(historyPage - 1)}>
                  <RiArrowLeftLine /> Prev
                </Button>
                <Button
                  variant="secondary"
                  disabled={historyPage >= Math.max(history.eligibility_total_pages, history.availability_total_pages)}
                  onClick={() => handleLoadHistory(historyPage + 1)}
                >
                  Next <RiArrowRightLine />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {donationsVisible && (
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiDropLine size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">My Donations</h3>
              <p className="text-sm text-[var(--text-secondary)]">Your recorded donation history with downloadable certificates.</p>
            </div>
          </div>

          {donations?.donations?.length > 0 ? (
            <>
              <div className="space-y-3">
                {donations.donations.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <RiHeartPulseLine className="text-[var(--crimson)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {new Date(d.donation_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {d.camp_name || "Camp not specified"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={downloadingId === d.id}
                      onClick={() => handleDownloadCertificate(d.id)}
                    >
                      <RiDownloadLine /> Certificate
                    </Button>
                  </div>
                ))}
              </div>

              {donations.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Page {donationPage} of {donations.total_pages} ({donations.total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={donationPage <= 1} onClick={() => handleLoadDonations(donationPage - 1)}>
                      <RiArrowLeftLine /> Prev
                    </Button>
                    <Button variant="secondary" disabled={donationPage >= donations.total_pages} onClick={() => handleLoadDonations(donationPage + 1)}>
                      Next <RiArrowRightLine />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center">
              <RiAwardLine size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="font-semibold text-[var(--text-primary)]">No donations recorded yet</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Your donations will appear here after UBTS staff records them.
              </p>
            </div>
          )}
        </Card>
      )}

      {campCalendarVisible && (
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <RiCalendarEventLine size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Upcoming Donation Camps</h3>
              <p className="text-sm text-[var(--text-secondary)]">Active blood donation camps — click any event for details.</p>
            </div>
          </div>

          {campEvents.length > 0 ? (
            <div style={{ height: 480 }} className="rounded-xl overflow-hidden">
              <Calendar
                localizer={calLocalizer}
                events={campEvents}
                startAccessor="start"
                endAccessor="end"
                views={["month", "agenda"]}
                defaultView="month"
                style={{ height: "100%" }}
                onSelectEvent={(event) => {
                  const c = event.resource;
                  setError("");
                  alert(
                    `${c.name}\n${c.venue}, ${c.district}, ${c.region}\n${c.start_date} → ${c.end_date}\nContact: ${c.contact_phone || "N/A"}`
                  );
                }}
                eventPropGetter={() => ({
                  style: { backgroundColor: "#C0162C", borderRadius: "6px", border: "none", fontSize: "12px" },
                })}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-muted)]">
              No active donation camps found.
            </div>
          )}
        </Card>
      )}

      {nearestCamp && (
        <Card className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Nearest Donation Camp
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {nearestCamp.assistant_response}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CampDetail label="Camp Name" value={camp?.name} />
            <CampDetail
              label="Distance"
              value={`${nearestCamp.distance_km} km away`}
            />
            <CampDetail label="Venue" value={camp?.venue} />
            <CampDetail label="District" value={camp?.district} />
            <CampDetail label="Region" value={camp?.region} />
            <CampDetail
              label="Contact"
              value={camp?.contact_phone || "Not provided"}
            />
          </div>

          <NearestCampMap camp={camp} />
        </Card>
      )}
    </div>
  );
}

function RetentionReminderCard({ retention, onFindCamp, locationLoading }) {
  const isReady = retention.can_send_reminder;
  const isPendingMedical = retention.reminder_type === "missing_medical_record";

  return (
    <Card
      className={`overflow-hidden border ${
        isReady
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
          : isPendingMedical
          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
          : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
      }`}
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isReady
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : isPendingMedical
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            }`}
          >
            {isReady ? (
              <RiNotification3Line size={24} />
            ) : (
              <RiCalendarEventLine size={24} />
            )}
          </div>

          <div>
            <p
              className={`text-sm font-semibold ${
                isReady
                  ? "text-emerald-700 dark:text-emerald-300"
                  : isPendingMedical
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              Retention Reminder
            </p>

            <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
              {retention.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              {retention.message}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {retention.days_since_last_donation !== null && (
                <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-[var(--text-secondary)] dark:bg-slate-900/40">
                  {retention.days_since_last_donation} days since last donation
                </span>
              )}

              {retention.days_remaining !== null && (
                <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-[var(--text-secondary)] dark:bg-slate-900/40">
                  {retention.days_remaining} days remaining
                </span>
              )}

              {retention.availability_result?.availability_probability !== null &&
                retention.availability_result?.availability_probability !==
                  undefined && (
                  <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-[var(--text-secondary)] dark:bg-slate-900/40">
                    Availability:{" "}
                    {Math.round(
                      retention.availability_result.availability_probability *
                        100
                    )}
                    %
                  </span>
                )}
            </div>
          </div>
        </div>

        {isReady && (
          <Button onClick={onFindCamp} loading={locationLoading}>
            <RiMapPinLine />
            Find Nearby Camp
          </Button>
        )}
      </div>
    </Card>
  );
}

function ImpactCard({ icon: Icon, label, value, text }) {
  return (
    <Card>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
        <Icon size={22} />
      </div>

      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {value}
      </h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p>
    </Card>
  );
}

function CampDetail({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--text-primary)]">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default DonorDashboard;