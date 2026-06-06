import { useEffect, useState } from "react";
import {
  RiHeartPulseLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiUserHeartLine,
} from "react-icons/ri";

import {
  getDonorProfile,
  getDonorMedicalRecord,
  checkEligibility,
  checkAvailability,
  findNearestCamp,
} from "../services/donorService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import NearestCampMap from "../components/NearestCampMap";

function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
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
    } catch {
      setError("Failed to load donor information.");
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
            View your donor profile, check eligibility after UBTS records your
            medical details, estimate availability, and locate nearby donation
            camps.
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--crimson)] px-6 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-red-100">
            Donor Status
          </p>
          <p className="text-2xl font-bold">
            {medicalRecord ? "Profile Ready" : "Awaiting Medical Record"}
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
            donation or medical screening. This card will remain visible until
            UBTS records your health details.
          </p>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
            <RiUserHeartLine size={22} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Donor Profile</p>
          <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
            {profile?.phone_number || "No phone added"}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {profile?.address || "Address not available"}
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2 last:border-0">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--text-primary)]">
        {value || "Not available"}
      </span>
    </div>
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