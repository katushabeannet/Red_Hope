import { useEffect, useState } from "react";
import {
  getAdminCamps,
  createCamp,
  updateCamp,
  deleteCamp,
} from "../services/campService";

const initialForm = {
  name: "",
  description: "",
  region: "",
  district: "",
  venue: "",
  latitude: "",
  longitude: "",
  start_date: "",
  end_date: "",
  contact_phone: "",
  status: "ACTIVE",
};

function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCamps();
  }, []);

  const loadCamps = async () => {
    try {
      setError("");
      const data = await getAdminCamps();
      setCamps(data);
    } catch {
      setError("Failed to load donation camps.");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleEdit = (camp) => {
    setEditingId(camp.id);
    setFormData({
      name: camp.name || "",
      description: camp.description || "",
      region: camp.region || "",
      district: camp.district || "",
      venue: camp.venue || "",
      latitude: camp.latitude || "",
      longitude: camp.longitude || "",
      start_date: camp.start_date || "",
      end_date: camp.end_date || "",
      contact_phone: camp.contact_phone || "",
      status: camp.status || "ACTIVE",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      if (editingId) {
        await updateCamp({ ...payload, id: editingId });
      } else {
        await createCamp(payload);
      }

      resetForm();
      loadCamps();
    } catch {
      setError("Failed to save donation camp.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campId) => {
    const confirmed = window.confirm("Delete this donation camp?");
    if (!confirmed) return;

    try {
      setError("");
      await deleteCamp(campId);
      loadCamps();
    } catch {
      setError("Failed to delete donation camp.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-slate-900">
          Donation Camp Management
        </h2>
        <p className="mt-2 text-slate-600">
          Add, update, activate, deactivate, or delete donation camp locations.
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          {editingId ? "Edit Donation Camp" : "Add New Donation Camp"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Camp name"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region"
            className="rounded-lg border p-3"
          />

          <input
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="District"
            className="rounded-lg border p-3"
          />

          <input
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="Venue"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            type="number"
            step="any"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            type="number"
            step="any"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            type="date"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            type="date"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="Contact phone"
            className="rounded-lg border p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="rounded-lg border p-3 md:col-span-2"
            rows="3"
          />

          <div className="flex gap-3 md:col-span-2">
            <button
              disabled={loading}
              className="rounded-lg bg-red-700 px-5 py-3 text-white hover:bg-red-800 disabled:bg-red-400"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Camp"
                : "Create Camp"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-slate-200 px-5 py-3 text-slate-800 hover:bg-slate-300"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Existing Donation Camps
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">Name</th>
                <th className="p-3">District</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Status</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {camps.map((camp) => (
                <tr key={camp.id} className="border-b">
                  <td className="p-3 font-medium">{camp.name}</td>
                  <td className="p-3">{camp.district}</td>
                  <td className="p-3">{camp.venue}</td>
                  <td className="p-3">{camp.status}</td>
                  <td className="p-3">
                    {camp.start_date} to {camp.end_date}
                  </td>
                  <td className="space-x-2 p-3">
                    <button
                      onClick={() => handleEdit(camp)}
                      className="rounded bg-slate-800 px-3 py-1 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="rounded bg-red-700 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {camps.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">
                    No donation camps found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminCamps;