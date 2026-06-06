import { useEffect, useState } from "react";
import {
  getDonorProfile,
  getDonorMedicalRecord,
  updateDonorProfile,
} from "../services/donorService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [editing, setEditing] = useState(false);
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
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateDonorProfile(formData);

      await loadProfile();

      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">My Profile</h2>

          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">
          Personal Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Phone Number"
            value={formData.phone_number}
            disabled={!editing}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone_number: e.target.value,
              })
            }
          />

          <Field
            label="Gender"
            value={formData.gender}
            disabled={!editing}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
          />

          <Field
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            disabled={!editing}
            onChange={(e) =>
              setFormData({
                ...formData,
                date_of_birth: e.target.value,
              })
            }
          />

          <Field
            label="Address"
            value={formData.address}
            disabled={!editing}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value,
              })
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">
          Medical Information
        </h3>

        {!medicalRecord ? (
          <div className="rounded-xl bg-amber-50 p-4 text-amber-700">
            Medical information has not yet been recorded by UBTS.
            This will be completed after donor screening.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Blood Group" value={profile?.blood_group} />
            <Info
              label="Weight"
              value={`${medicalRecord.weight_kg} kg`}
            />
            <Info
              label="Hemoglobin"
              value={medicalRecord.hemoglobin_level}
            />
            <Info
              label="Last Donation"
              value={medicalRecord.last_donation_date}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function Field(props) {
  return (
    <div>
      <label className="mb-2 block text-sm">{props.label}</label>
      <input
        type={props.type || "text"}
        value={props.value}
        disabled={props.disabled}
        onChange={props.onChange}
        className="w-full rounded-xl border p-3"
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value || "Not Available"}</p>
    </div>
  );
}

export default MyProfile;