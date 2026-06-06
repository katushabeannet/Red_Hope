import { useEffect, useState } from "react";
import {
  RiHeartPulseLine,
  RiRefreshLine,
  RiSearchLine,
  RiUserHeartLine,
} from "react-icons/ri";

import {
  getAdminDonors,
  saveAdminMedicalRecord,
} from "../services/adminDonorService";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const initialMedicalForm = {
  donor_id: "",
  blood_group: "O+",
  weight_kg: "",
  hemoglobin_level: "",
  has_recent_illness: false,
  has_chronic_condition: false,
  last_donation_date: "",
  is_pregnant: false,
  is_on_medication: false,
};

function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [formData, setFormData] = useState(initialMedicalForm);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getAdminDonors();
      setDonors(data);
    } catch {
      setError("Failed to load donors.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
    setSuccess("");
    setError("");

    setFormData({
      donor_id: donor.id,
      blood_group: donor.blood_group || "O+",
      weight_kg: donor.medical_record?.weight_kg || "",
      hemoglobin_level: donor.medical_record?.hemoglobin_level || "",
      has_recent_illness: donor.medical_record?.has_recent_illness || false,
      has_chronic_condition:
        donor.medical_record?.has_chronic_condition || false,
      last_donation_date: donor.medical_record?.last_donation_date || "",
      is_pregnant: donor.medical_record?.is_pregnant || false,
      is_on_medication: donor.medical_record?.is_on_medication || false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveMedicalRecord = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveAdminMedicalRecord({
        ...formData,
        weight_kg: Number(formData.weight_kg),
        hemoglobin_level: Number(formData.hemoglobin_level),
        last_donation_date: formData.last_donation_date || null,
      });

      setSuccess("Medical information saved successfully.");
      await loadDonors();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to save donor medical information."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const text = `${donor.full_name} ${donor.email} ${donor.phone_number} ${donor.address}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const donorsWithMedical = donors.filter((donor) => donor.medical_record).length;
  const donorsPendingMedical = donors.length - donorsWithMedical;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Donor Medical Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Donors & Medical Records
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            View registered donors and record their medical information after
            UBTS screening or donation.
          </p>
        </div>

        <Button variant="secondary" onClick={loadDonors}>
          <RiRefreshLine />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </Card>
      )}

      {success && (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20">
          {success}
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Total Donors" value={donors.length} />
        <SummaryCard label="Medical Records Added" value={donorsWithMedical} />
        <SummaryCard label="Pending Medical Records" value={donorsPendingMedical} />
      </div>

      {selectedDonor && (
        <Card>
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Add / Update Medical Information
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Selected donor:{" "}
                <span className="font-semibold">{selectedDonor.full_name}</span>
              </p>
            </div>

            <Badge
              label={selectedDonor.medical_record ? "Updating" : "New Record"}
              variant={selectedDonor.medical_record ? "completed" : "active"}
            />
          </div>

          <form
            onSubmit={handleSaveMedicalRecord}
            className="grid gap-4 md:grid-cols-2"
          >
            <Select
              label="Blood Group"
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />

            <Field
              label="Weight (kg)"
              type="number"
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleChange}
              required
            />

            <Field
              label="Hemoglobin Level"
              type="number"
              step="any"
              name="hemoglobin_level"
              value={formData.hemoglobin_level}
              onChange={handleChange}
              required
            />

            <Field
              label="Last Donation Date"
              type="date"
              name="last_donation_date"
              value={formData.last_donation_date}
              onChange={handleChange}
            />

            <CheckBox
              label="Recent Illness"
              name="has_recent_illness"
              checked={formData.has_recent_illness}
              onChange={handleChange}
            />

            <CheckBox
              label="Chronic Condition"
              name="has_chronic_condition"
              checked={formData.has_chronic_condition}
              onChange={handleChange}
            />

            <CheckBox
              label="Currently Pregnant"
              name="is_pregnant"
              checked={formData.is_pregnant}
              onChange={handleChange}
            />

            <CheckBox
              label="On Medication"
              name="is_on_medication"
              checked={formData.is_on_medication}
              onChange={handleChange}
            />

            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" loading={saving}>
                <RiHeartPulseLine />
                Save Medical Information
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedDonor(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Registered Donors
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Select a donor to add or update medical information.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3">
            <RiSearchLine className="text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donors..."
              className="bg-transparent p-2 text-sm text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
            Loading donors...
          </div>
        ) : filteredDonors.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 font-medium">Donor</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Medical Status</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonors.map((donor) => (
                  <tr
                    key={donor.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--crimson-light)] text-[var(--crimson)]">
                          <RiUserHeartLine />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {donor.full_name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {donor.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-[var(--text-secondary)]">
                      {donor.phone_number || "Not available"}
                    </td>

                    <td className="p-3 text-[var(--text-secondary)]">
                      {donor.address || "Not available"}
                    </td>

                    <td className="p-3">
                      <Badge
                        label={
                          donor.medical_record
                            ? "Medical Added"
                            : "Pending Medical"
                        }
                        variant={donor.medical_record ? "eligible" : "inactive"}
                      />
                    </td>

                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSelectDonor(donor)}
                      >
                        {donor.medical_record ? "Update" : "Add Medical"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDonor(donor)}
                        >
                        View
                    </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
            No donors found.
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
    </Card>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  step,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <input
        type={type}
        step={step}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckBox({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm font-medium text-[var(--text-primary)]">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-red-700"
      />
      {label}
    </label>
  );
}

export default AdminDonors;