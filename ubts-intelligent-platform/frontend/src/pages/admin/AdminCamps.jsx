import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiEditLine,
  RiFilterLine,
  RiListCheck,
  RiMapPinLine,
  RiQrCodeLine,
  RiRefreshLine,
  RiSearchLine,
  RiTimeLine,
} from "react-icons/ri";
import { useTheme } from "../../context/ThemeContext";
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
import { v } from "../../utils/validators";

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

const STATUS_BADGE = { ACTIVE: "badge-green", INACTIVE: "badge-amber", UPCOMING: "badge-blue", COMPLETED: "badge-gray" };

function AdminCamps() {
  const { dark } = useTheme();
  const [camps, setCamps] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: null }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
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
    setShowForm(true);
  };

  const openAddForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const validateCampForm = () => {
    const errs = {
      name:          v.minLen(formData.name, 3, "Camp name") || v.maxLen(formData.name, 100, "Camp name"),
      venue:         v.minLen(formData.venue, 3, "Venue") || v.maxLen(formData.venue, 200, "Venue"),
      region:        formData.region ? v.maxLen(formData.region, 100, "Region") : null,
      district:      formData.district ? v.maxLen(formData.district, 100, "District") : null,
      latitude:      v.required(formData.latitude, "Latitude") || v.latitude(formData.latitude),
      longitude:     v.required(formData.longitude, "Longitude") || v.longitude(formData.longitude),
      start_date:    v.required(formData.start_date, "Start date"),
      end_date:      v.required(formData.end_date, "End date") || v.endAfterStart(formData.start_date, formData.end_date),
      contact_phone: formData.contact_phone ? v.phone(formData.contact_phone) : null,
      description:   formData.description ? v.maxLen(formData.description, 1000, "Description") : null,
    };
    setFieldErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCampForm()) { setError("Please fix the errors below before saving."); return; }
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

  const [campSearch, setCampSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campPage, setCampPage] = useState(1);
  const CAMP_PAGE_SIZE = 8;
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

  const activeCount   = camps.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = camps.filter((c) => c.status === "INACTIVE").length;
  const upcomingCount = camps.filter((c) => c.status === "UPCOMING").length;
  const completedCount = camps.filter((c) => c.status === "COMPLETED").length;

  const filteredCamps = useMemo(() => {
    let result = camps;
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (campSearch.trim()) {
      const q = campSearch.toLowerCase();
      result = result.filter((c) =>
        c.name?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q) ||
        c.venue?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [camps, campSearch, statusFilter]);

  const campTotalPages = Math.ceil(filteredCamps.length / CAMP_PAGE_SIZE) || 1;
  const pagedCamps = filteredCamps.slice((campPage - 1) * CAMP_PAGE_SIZE, campPage * CAMP_PAGE_SIZE);

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Camp Management</div>
          <h1 className="page-title rh-display">Donation Camp Locations</h1>
          <p className="page-desc">Create, update, activate, deactivate, and remove blood donation camp locations used by the nearest-camp recommendation engine.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openAddForm}>
            <RiAddLine /> Add Camp
          </button>
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

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 28 }}>
        <CampTierCard icon={RiMapPinLine}          label="Active Camps"    value={activeCount}    tone="green" tier="sub"    dark={dark} />
        <CampTierCard icon={RiTimeLine}            label="Upcoming Camps"  value={upcomingCount}  tone="blue"  tier="normal" dark={dark} />
        <CampTierCard icon={RiCalendarLine}        label="Inactive Camps"  value={inactiveCount}  tone="amber" tier="normal" dark={dark} />
        <CampTierCard icon={RiCheckboxCircleLine}  label="Completed Camps" value={completedCount} tone="red"   tier="normal" dark={dark} />
      </div>

      {/* Camp form modal */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", padding: 16 }}
          onClick={resetForm}
        >
          <div
            style={{ position: "relative", width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", borderRadius: 20, background: dark ? "#1E293B" : "#fff", padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetForm}
              style={{ position: "absolute", right: 20, top: 20, borderRadius: 999, padding: 6, border: "none", background: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", cursor: "pointer", color: "var(--ink-l)", display: "flex" }}
            >
              <RiCloseLine size={20} />
            </button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{editingId ? "Edit Donation Camp" : "Add New Donation Camp"}</div>
              <div style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 4 }}>Provide camp details and exact coordinates for map-based recommendations.</div>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Camp Name *" name="name" value={formData.name} onChange={handleChange} placeholder="Kampala Central Blood Drive" error={fieldErrors.name} />
              <Field label="Region" name="region" value={formData.region} onChange={handleChange} placeholder="Central" error={fieldErrors.region} />
              <Field label="District" name="district" value={formData.district} onChange={handleChange} placeholder="Kampala" error={fieldErrors.district} />
              <Field label="Venue *" name="venue" value={formData.venue} onChange={handleChange} placeholder="City Square" error={fieldErrors.venue} />
              <Field label="Latitude * (−90 to 90)" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="0.3136" type="number" step="any" error={fieldErrors.latitude} />
              <Field label="Longitude * (−180 to 180)" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="32.5811" type="number" step="any" error={fieldErrors.longitude} />
              <Field label="Start Date *" name="start_date" value={formData.start_date} onChange={handleChange} type="date" error={fieldErrors.start_date} />
              <Field label="End Date *" name="end_date" value={formData.end_date} onChange={handleChange} type="date" error={fieldErrors.end_date} />
              <Field label="Contact Phone (optional)" name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="+256700000000 or 0700000000" error={fieldErrors.contact_phone} />

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
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: 10, padding: "7px 12px", background: dark ? "#1E293B" : "#fff", gap: 8 }}>
                <RiSearchLine size={15} style={{ color: "var(--ink-l)", flexShrink: 0 }} />
                <input
                  value={campSearch}
                  onChange={(e) => { setCampSearch(e.target.value); setCampPage(1); }}
                  placeholder="Search camps..."
                  style={{ border: "none", outline: "none", fontSize: 13, color: "var(--ink)", background: "transparent", width: 150 }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <RiFilterLine size={14} style={{ color: "var(--ink-l)" }} />
                {["", "ACTIVE", "UPCOMING", "INACTIVE", "COMPLETED"].map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setCampPage(1); }}
                    style={{ borderRadius: 999, padding: "4px 11px", fontSize: 11, fontWeight: 600, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                      background: statusFilter === s ? "var(--cr)" : (dark ? "#0F172A" : "#fff"),
                      color: statusFilter === s ? "#fff" : "var(--ink-s)",
                      borderColor: statusFilter === s ? "var(--cr)" : "var(--border)" }}>
                    {s || "All"}
                  </button>
                ))}
              </div>
              <span className="badge badge-gray">{filteredCamps.length} of {camps.length}</span>
            </div>
          </div>
          <div className="panel-body">
            {tableLoading ? (
              <AdminLoader text="Loading donation camps…" />
            ) : filteredCamps.length > 0 ? (
              <>
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
                      {pagedCamps.map((camp) => (
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
                {campTotalPages > 1 && (
                  <div className="pagination-row" style={{ padding: "12px 20px" }}>
                    <span className="page-info">
                      Page {campPage} of {campTotalPages} — {filteredCamps.length} camp{filteredCamps.length !== 1 ? "s" : ""}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setCampPage((p) => Math.max(1, p - 1))} disabled={campPage === 1}>
                        <RiArrowLeftLine size={14} /> Prev
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setCampPage((p) => Math.min(campTotalPages, p + 1))} disabled={campPage === campTotalPages}>
                        Next <RiArrowRightLine size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state"><RiMapPinLine size={28} /><p>{campSearch || statusFilter ? "No camps match your filter." : "No donation camps found."}</p></div>
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

function Field({ label, name, value, onChange, placeholder, type = "text", required = false, step, error }) {
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
        style={{ width: "100%", borderRadius: 10, border: `1px solid ${error ? "#DC2626" : "var(--border)"}`, background: "var(--canvas)", padding: "10px 12px", fontSize: 13, color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
      />
      {error && <span style={{ fontSize: 11, color: "#DC2626", marginTop: 3, display: "block" }}>{error}</span>}
    </div>
  );
}

const _CAMP_SPARK = [40, 60, 35, 75, 50, 85, 60];

function CampTierCard({ icon: Icon, label, value, tone = "green", tier = "sub", dark }) {
  const accentMap  = { green: "var(--green)", blue: "var(--blue)", amber: "var(--amber)", red: "var(--cr)" };
  const accentXlLt = { green: "#F0FDF4", blue: "#EFF6FF", amber: "#FFFBEB", red: "#FDEEF1" };
  const accentXlDk = { green: "rgba(22,163,74,.18)", blue: "rgba(37,99,235,.18)", amber: "rgba(217,119,6,.18)", red: "rgba(196,30,58,.18)" };
  const accent   = accentMap[tone]  || "var(--green)";
  const accentXl = (dark ? accentXlDk : accentXlLt)[tone] || (dark ? "rgba(22,163,74,.18)" : "#F0FDF4");

  if (tier === "sub") {
    return (
      <div className="card-submain" style={{ "--accent": accent, "--accent-xl": accentXl }}>
        <div className="card-sub-icon"><Icon size={20} /></div>
        <div className="card-sub-val">{value ?? "—"}</div>
        <div className="card-sub-label">{label}</div>
        <div className="card-sub-sparkline">
          {_CAMP_SPARK.map((h, i) => <div key={i} className="card-sub-bar" style={{ height: `${h}%` }} />)}
        </div>
      </div>
    );
  }
  return (
    <div className="card-normal" style={{ "--accent": accent, "--accent-xl": accentXl }}>
      <div className="card-norm-icon"><Icon size={18} /></div>
      <div className="card-norm-val">{value ?? "—"}</div>
      <div className="card-norm-label">{label}</div>
    </div>
  );
}

export default AdminCamps;
