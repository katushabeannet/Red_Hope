import { useEffect, useState } from "react";
import { RiCloseLine, RiEditLine, RiUserHeartLine } from "react-icons/ri";

import {
  getDonorProfile,
  getDonorMedicalRecord,
  updateDonorProfile,
} from "../services/donorService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";

function MyProfile() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone_number: "",
    gender: "",
    address: "",
    date_of_birth: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await getDonorProfile();
      setProfile(profileData);

      setFormData({
        phone_number: profileData.phone_number || "",
        gender: profileData.gender || "",
        address: profileData.address || "",
        date_of_birth: profileData.date_of_birth || "",
      });

      try {
        const medical = await getDonorMedicalRecord();
        setMedicalRecord(medical);
      } catch {
        setMedicalRecord(null);
      }
    } catch {
      showToast({
        type: "error",
        title: "Profile Load Failed",
        message: "Unable to load your donor profile.",
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateDonorProfile(formData);
      await loadProfile();

      setShowEditModal(false);

      showToast({
        type: "success",
        title: "Profile Updated",
        message: "Your profile information has been updated successfully.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Your profile could not be updated. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-[var(--crimson)]">
              Donor Profile
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              View your personal donor information and medical record status.
            </p>
          </div>

          <Button onClick={() => setShowEditModal(true)}>
            <RiEditLine />
            Edit Profile
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
              <RiUserHeartLine size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Personal Information
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Registered donor details
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <InfoRow label="Full Name" value={profile?.full_name} />
            <InfoRow label="Email" value={profile?.email} />
            <InfoRow label="Phone Number" value={profile?.phone_number} />
            <InfoRow label="Gender" value={profile?.gender} />
            <InfoRow label="Date of Birth" value={profile?.date_of_birth} />
            <InfoRow label="Address" value={profile?.address} />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Medical Information
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Recorded by UBTS after screening
              </p>
            </div>

            <Badge
              label={medicalRecord ? "Recorded" : "Pending"}
              variant={medicalRecord ? "eligible" : "inactive"}
            />
          </div>

          {!medicalRecord ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Medical information has not yet been recorded by UBTS. This will
              be completed after your donation or screening.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <InfoRow label="Blood Group" value={profile?.blood_group} />
              <InfoRow
                label="Weight"
                value={
                  medicalRecord.weight_kg
                    ? `${medicalRecord.weight_kg} kg`
                    : null
                }
              />
              <InfoRow
                label="Hemoglobin"
                value={
                  medicalRecord.hemoglobin_level
                    ? `${medicalRecord.hemoglobin_level} g/dL`
                    : null
                }
              />
              <InfoRow
                label="Last Donation"
                value={medicalRecord.last_donation_date}
              />
              <InfoRow
                label="Recent Illness"
                value={medicalRecord.has_recent_illness ? "Yes" : "No"}
              />
              <InfoRow
                label="Chronic Condition"
                value={medicalRecord.has_chronic_condition ? "Yes" : "No"}
              />
              <InfoRow
                label="On Medication"
                value={medicalRecord.is_on_medication ? "Yes" : "No"}
              />
            </div>
          )}
        </Card>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Edit Profile
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Update your contact and personal information.
                </p>
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-5">
              <Field
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />

              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                options={["Male", "Female", "Other"]}
              />

              <Field
                label="Date of Birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />

              <Field
                label="Address"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
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

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MyProfile;