import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCalendarLine,
  RiCloseLine,
  RiEditLine,
  RiListCheck,
  RiMapPinLine,
  RiQrCodeLine,
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
  getCampQR,
} from "../../services/campService";

import AdminLoader from "../../components/common/AdminLoader";
import DeleteBtn from "../../components/common/DeleteBtn";

const calLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

const _dnd = withDragAndDrop?.default ?? withDragAndDrop;
const DnDCalendar = _dnd(Calendar);

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

const STATUS_BADGE = { ACTIVE: "badge-green", INACTIVE: "badge-amber", COMPLETED: "badge-blue" };

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

  const [qrModal, setQrModal] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const handleGetQR = async (camp) => {
    try {
      setQrLoading(true);
      setError("");
      const data = await getCampQR(camp.id);
      setQrModal(data);
    } catch {
      setError("Failed to generate QR code. Make sure qrcode[pil] is installed.");
    } finally {
      setQrLoading(false);
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
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Camp Management</div>
          <h1 className="page-title rh-display">Donation Camp Locations</h1>
          <p className="page-desc">Create, update, activate, deactivate, and remove blood donation camp locations used by the nearest-camp recommendation engine.</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline"}`} onClick={() => setViewMode("table")}>
            <RiListCheck /> Table
          </button>
          <button className={`btn btn-sm ${viewMode === "calendar" ? "btn-primary" : "btn-outline"}`} onClick={() => setViewMode("calendar")}>
            <RiCalendarLine /> Calendar
          </button>
          <button className="btn btn-outline btn-sm" onClick={loadCamps}>
            <RiRefreshLine /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="adm-alert adm-alert-error">{error}</div>}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <SummaryCard label="Active Camps" value={activeCount} tone="cr" />
        <SummaryCard label="Inactive Camps" value={inactiveCount} tone="am" />
        <SummaryCard label="Completed Camps" value={completedCount} tone="bl" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon cr"><RiAddLine size={16} /></div>
            <div>
              <div className="panel-title">{editingId ? "Edit Donation Camp" : "Add New Donation Camp"}</div>
              <div className="panel-sub">Provide camp details and exact coordinates for map-based recommendations.</div>
            </div>
          </div>
          {editingId && <span className="badge badge-amber">Editing</span>}
        </div>

        <div className="panel-body">
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Camp Name" name="name" value={formData.name} onChange={handleChange} placeholder="Kampala Central Blood Drive" required />
            <Field label="Region" name="region" value={formData.region} onChange={handleChange} placeholder="Central" />
            <Field label="District" name="district" value={formData.district} onChange={handleChange} placeholder="Kampala" />
            <Field label="Venue" name="venue" value={formData.venue} onChange={handleChange} placeholder="City Square" required />
            <Field label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="0.3136" type="number" step="any" required />
            <Field label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="32.5811" type="number" step="any" required />
            <Field label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} type="date" required />
            <Field label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} type="date" required />
            <Field label="Contact Phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="0800123456" />

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none" }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the donation camp"
                rows="3"
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="btn-spin" /> : editingId ? <RiEditLine /> : <RiAddLine />}
                {editingId ? "Update Camp" : "Create Camp"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel Edit</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon bl"><RiCalendarLine size={16} /></div>
              <div>
                <div className="panel-title">Camp Calendar</div>
                <div className="panel-sub">Drag events to reschedule. Click an event to edit it.</div>
              </div>
            </div>
            <span className="badge badge-gray">{camps.length} camps</span>
          </div>
          <div className="panel-body">
            {tableLoading ? (
              <AdminLoader text="Loading camps…" />
            ) : calendarEvents.length > 0 ? (
              <div style={{ height: 560, overflow: "hidden", borderRadius: 12 }}>
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
              <div className="empty-state"><RiCalendarLine size={28} /><p>No camps with dates set. Add start and end dates to see them on the calendar.</p></div>
            )}
          </div>
        </div>
      )}

      {viewMode === "table" && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title-row">
              <div className="panel-icon cr"><RiListCheck size={16} /></div>
              <div>
                <div className="panel-title">Existing Donation Camps</div>
                <div className="panel-sub">These camps are used by donor and chatbot nearest-camp workflows.</div>
              </div>
            </div>
            <span className="badge badge-gray">{camps.length} total</span>
          </div>
          <div className="panel-body">
            {tableLoading ? (
              <AdminLoader text="Loading donation camps…" />
            ) : camps.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Camp</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Dates</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camps.map((camp) => (
                      <tr key={camp.id}>
                        <td>
                          <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{camp.name}</p>
                          <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{camp.contact_phone || "No contact"}</p>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--ink-s)" }}>
                            <RiMapPinLine style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: 0 }}>{camp.venue}</p>
                              <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>{camp.district}, {camp.region}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[camp.status] ?? "badge-gray"}`}>{camp.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: "var(--ink-s)" }}>
                            <RiCalendarLine style={{ marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: 0 }}>{camp.start_date}</p>
                              <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>to {camp.end_date}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(camp)}>
                              <RiEditLine /> Edit
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleGetQR(camp)} disabled={qrLoading}>
                              {qrLoading ? <span className="btn-spin-dk" /> : <RiQrCodeLine />} QR
                            </button>
                            <DeleteBtn onClick={() => handleDelete(camp.id)} title="Delete camp" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><RiMapPinLine size={28} /><p>No donation camps found.</p></div>
            )}
          </div>
        </div>
      )}

      {qrModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", padding: 16 }}
          onClick={() => setQrModal(null)}
        >
          <div
            style={{ position: "relative", width: "100%", maxWidth: 360, borderRadius: 20, background: "var(--surface,#fff)", padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrModal(null)}
              style={{ position: "absolute", right: 16, top: 16, borderRadius: 999, padding: 4, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-l)" }}
            >
              <RiCloseLine size={20} />
            </button>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Camp Check-in QR Code</h3>
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--ink-s)" }}>{qrModal.camp_name}</p>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", borderRadius: 12, background: "#fff", padding: 16 }}>
              <img
                src={`data:image/png;base64,${qrModal.qr_image_base64}`}
                alt="Camp QR Code"
                style={{ width: 224, height: 224 }}
              />
            </div>

            <p style={{ marginTop: 12, wordBreak: "break-all", textAlign: "center", fontSize: 12, color: "var(--ink-l)" }}>
              {qrModal.checkin_url}
            </p>

            <a
              href={`data:image/png;base64,${qrModal.qr_image_base64}`}
              download={`camp_${qrModal.camp_id}_qr.png`}
              style={{ marginTop: 16, display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--ink)", textDecoration: "none", boxSizing: "border-box" }}
            >
              <RiQrCodeLine /> Download QR PNG
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text", required = false, step }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        step={step}
        required={required}
        style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "var(--canvas)", padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><RiMapPinLine size={18} /></div>
      <div className="stat-body">
        <div className="stat-val">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default AdminCamps;
