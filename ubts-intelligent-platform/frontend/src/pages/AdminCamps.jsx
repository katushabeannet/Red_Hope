import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCalendarLine,
  RiDeleteBinLine,
  RiEditLine,
  RiListCheck,
  RiMapPinLine,
  RiRefreshLine,
} from "react-icons/ri";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  getAdminCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  rescheduleCamp,
} from "../services/campService";

const calLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const DnDCalendar = withDragAndDrop(Calendar);

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

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
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    loadCamps();
  }, []);

  const loadCamps = async () => {
    try {
      setError("");
      setTableLoading(true);
      const data = await getAdminCamps();
      setCamps(data);
    } catch {
      setError("Failed to load donation camps.");
    } finally {
      setTableLoading(false);
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

    window.scrollTo({ top: 0, behavior: "smooth" });
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
      await loadCamps();
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
      await loadCamps();
    } catch {
      setError("Failed to delete donation camp.");
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      setError("");
      const fmt = (d) => d.toISOString().split("T")[0];
      await rescheduleCamp(event.id, fmt(start), fmt(end));
      await loadCamps();
    } catch {
      setError("Failed to reschedule camp. Please try again.");
    }
  };

  const calendarEvents = camps
    .filter((c) => c.start_date && c.end_date)
    .map((c) => ({
      id: c.id,
      title: c.name,
      start: new Date(c.start_date),
      end: new Date(c.end_date),
      resource: c,
    }));

  const activeCount = camps.filter((camp) => camp.status === "ACTIVE").length;
  const inactiveCount = camps.filter((camp) => camp.status === "INACTIVE").length;
  const completedCount = camps.filter((camp) => camp.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Camp Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Donation Camp Locations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Create, update, activate, deactivate, and remove blood donation camp
            locations used by the nearest-camp recommendation engine.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant={viewMode === "table" ? "primary" : "secondary"} onClick={() => setViewMode("table")}>
            <RiListCheck /> Table
          </Button>
          <Button variant={viewMode === "calendar" ? "primary" : "secondary"} onClick={() => setViewMode("calendar")}>
            <RiCalendarLine /> Calendar
          </Button>
          <Button variant="secondary" onClick={loadCamps}>
            <RiRefreshLine /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20">
          {error}
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard label="Active Camps" value={activeCount} variant="active" />
        <SummaryCard label="Inactive Camps" value={inactiveCount} variant="inactive" />
        <SummaryCard
          label="Completed Camps"
          value={completedCount}
          variant="completed"
        />
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {editingId ? "Edit Donation Camp" : "Add New Donation Camp"}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Provide camp details and exact coordinates for map-based
              recommendations.
            </p>
          </div>

          {editingId && (
            <Badge label="Editing" variant="completed" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Field
            label="Camp Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Kampala Central Blood Drive"
            required
          />

          <Field
            label="Region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Central"
          />

          <Field
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Kampala"
          />

          <Field
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="City Square"
            required
          />

          <Field
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="0.3136"
            type="number"
            step="any"
            required
          />

          <Field
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="32.5811"
            type="number"
            step="any"
            required
          />

          <Field
            label="Start Date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            type="date"
            required
          />

          <Field
            label="End Date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            type="date"
            required
          />

          <Field
            label="Contact Phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="0800123456"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the donation camp"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
              rows="3"
            />
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit" loading={loading}>
              {editingId ? <RiEditLine /> : <RiAddLine />}
              {editingId ? "Update Camp" : "Create Camp"}
            </Button>

            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      {viewMode === "calendar" && (
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Camp Calendar</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Drag events to reschedule. Click an event to edit it.
              </p>
            </div>
            <Badge label={`${camps.length} camps`} variant="donor" />
          </div>

          {tableLoading ? (
            <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
              Loading camps...
            </div>
          ) : calendarEvents.length > 0 ? (
            <div style={{ height: 560 }} className="overflow-hidden rounded-xl">
              <DnDCalendar
                localizer={calLocalizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                views={["month", "week", "agenda"]}
                style={{ height: "100%" }}
                draggableAccessor={() => true}
                onEventDrop={handleEventDrop}
                onSelectEvent={(event) => handleEdit(event.resource)}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor:
                      event.resource?.status === "ACTIVE"
                        ? "#C0162C"
                        : event.resource?.status === "COMPLETED"
                        ? "#64748b"
                        : "#f59e0b",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "12px",
                  },
                })}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
              No camps with dates set. Add start and end dates to see them on the calendar.
            </div>
          )}
        </Card>
      )}

      {viewMode === "table" && (
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Existing Donation Camps
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              These camps are used by donor and chatbot nearest-camp workflows.
            </p>
          </div>

          <Badge label={`${camps.length} total`} variant="donor" />
        </div>

        {tableLoading ? (
          <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
            Loading donation camps...
          </div>
        ) : camps.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-3 font-medium">Camp</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Dates</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {camps.map((camp) => (
                  <tr
                    key={camp.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">
                        {camp.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {camp.contact_phone || "No contact"}
                      </p>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2 text-[var(--text-secondary)]">
                        <RiMapPinLine className="mt-0.5 shrink-0" />
                        <div>
                          <p>{camp.venue}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {camp.district}, {camp.region}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge
                        label={camp.status}
                        variant={camp.status.toLowerCase()}
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2 text-[var(--text-secondary)]">
                        <RiCalendarLine className="mt-0.5 shrink-0" />
                        <div>
                          <p>{camp.start_date}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            to {camp.end_date}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(camp)}
                        >
                          <RiEditLine />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(camp.id)}
                        >
                          <RiDeleteBinLine />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-secondary)]">
            No donation camps found.
          </div>
        )}
      </Card>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
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
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        step={step}
        required={required}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--crimson)]"
      />
    </div>
  );
}

function SummaryCard({ label, value, variant }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <Badge label={label.split(" ")[0]} variant={variant} />
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </Card>
  );
}

export default AdminCamps;