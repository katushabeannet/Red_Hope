import { useEffect, useState } from "react";
import {
  getDonorProfile,
  getDonorMedicalRecord,
  checkEligibility,
  checkAvailability,
  findNearestCamp,
} from "../services/donorService";
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

      const medicalData = await getDonorMedicalRecord();
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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-slate-900">Donor Dashboard</h2>
        <p className="mt-2 text-slate-600">
          View your donor profile, check eligibility, estimate availability, and
          find your nearest active donation camp.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Donor Profile
          </h3>

          {profile ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Blood Group:</strong> {profile.blood_group}</p>
              <p><strong>Phone:</strong> {profile.phone_number}</p>
              <p><strong>Gender:</strong> {profile.gender}</p>
              <p><strong>Address:</strong> {profile.address}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No profile loaded.</p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Medical Record
          </h3>

          {medicalRecord ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>Weight:</strong> {medicalRecord.weight_kg} kg</p>
              <p><strong>Hemoglobin:</strong> {medicalRecord.hemoglobin_level} g/dL</p>
              <p><strong>Recent Illness:</strong> {medicalRecord.has_recent_illness ? "Yes" : "No"}</p>
              <p><strong>Chronic Condition:</strong> {medicalRecord.has_chronic_condition ? "Yes" : "No"}</p>
              <p><strong>On Medication:</strong> {medicalRecord.is_on_medication ? "Yes" : "No"}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No medical record loaded.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Donor Intelligence Tools
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEligibilityCheck}
            disabled={loading}
            className="rounded-lg bg-red-700 px-4 py-2 text-white hover:bg-red-800 disabled:bg-red-400"
          >
            Check Eligibility
          </button>

          <button
            onClick={handleAvailabilityCheck}
            disabled={loading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:bg-slate-400"
          >
            Check Availability
          </button>

          <button
            onClick={handleNearestCamp}
            disabled={locationLoading}
            className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:bg-green-400"
          >
            {locationLoading ? "Finding Camp..." : "Find Nearest Camp"}
          </button>
        </div>
      </section>

      {eligibilityResult && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Eligibility Result
          </h3>
          <p className="text-slate-700">{eligibilityResult.assistant_response}</p>
        </section>
      )}

      {availabilityResult && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Availability Result
          </h3>
          <p className="text-slate-700">{availabilityResult.assistant_response}</p>
        </section>
      )}

      {nearestCamp && (
        <section className="space-y-5 rounded-2xl bg-white p-6 shadow">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Nearest Donation Camp
            </h3>

            <p className="mt-2 text-slate-700">
              {nearestCamp.assistant_response}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Camp Name</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.nearest_camp?.name}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Distance</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.distance_km} km away
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Venue</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.nearest_camp?.venue}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">District</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.nearest_camp?.district}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Region</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.nearest_camp?.region}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Contact</p>
              <p className="mt-1 font-semibold text-slate-900">
                {nearestCamp.nearest_camp?.contact_phone || "Not provided"}
              </p>
            </div>
          </div>

          <NearestCampMap camp={nearestCamp.nearest_camp} />
        </section>
      )}
    </div>
  );
}

export default DonorDashboard;