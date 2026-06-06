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
      const medicalData = await getDonorMedicalRecord();

      setProfile(profileData);
      setMedicalRecord(medicalData);
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
      setError("Failed to check eligibility.");
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
      setError("Failed to check availability.");
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
            Welcome, {profile?.user?.full_name || "Sample Donor"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Check donation eligibility, estimate availability, and locate the
            nearest active blood donation camp.
          </p>
        </div>

        {profile?.blood_group && (
          <div className="rounded-2xl bg-[var(--crimson)] px-6 py-4 text-white">
            <p className="text-xs uppercase tracking-wide text-red-100">
              Blood Group
            </p>
            <p className="text-3xl font-bold">{profile.blood_group}</p>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
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
            {medicalRecord?.weight_kg
              ? `${medicalRecord.weight_kg} kg`
              : "No weight record"}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Hemoglobin: {medicalRecord?.hemoglobin_level || "N/A"} g/dL
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Profile Details
          </h3>

          <div className="space-y-3 text-sm">
            <InfoRow label="Blood Group" value={profile?.blood_group} />
            <InfoRow label="Phone" value={profile?.phone_number} />
            <InfoRow label="Gender" value={profile?.gender} />
            <InfoRow label="Address" value={profile?.address} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Medical Record
          </h3>

          <div className="space-y-3 text-sm">
            <InfoRow
              label="Weight"
              value={
                medicalRecord?.weight_kg
                  ? `${medicalRecord.weight_kg} kg`
                  : null
              }
            />
            <InfoRow
              label="Hemoglobin"
              value={
                medicalRecord?.hemoglobin_level
                  ? `${medicalRecord.hemoglobin_level} g/dL`
                  : null
              }
            />
            <InfoRow
              label="Recent Illness"
              value={medicalRecord?.has_recent_illness ? "Yes" : "No"}
            />
            <InfoRow
              label="Chronic Condition"
              value={medicalRecord?.has_chronic_condition ? "Yes" : "No"}
            />
            <InfoRow
              label="On Medication"
              value={medicalRecord?.is_on_medication ? "Yes" : "No"}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Donor Intelligence Tools
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Run verified backend checks using your stored donor and medical
              data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleEligibilityCheck} loading={loading}>
              <RiShieldCheckLine />
              Check Eligibility
            </Button>

            <Button
              variant="secondary"
              onClick={handleAvailabilityCheck}
              loading={loading}
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

          {availabilityAssessment?.availability_probability !== undefined && (
            <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
              Probability: {availabilityAssessment.availability_probability}
            </p>
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
            <CampDetail label="Distance" value={`${nearestCamp.distance_km} km away`} />
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
      <span className="font-medium text-[var(--text-primary)]">
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