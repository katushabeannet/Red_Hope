import { useState } from "react";
import { v } from "../../utils/validators";
import reddyHero from "../../assets/wallpapers/reddy.jpeg";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  RiCheckboxCircleLine,
  RiDropLine,
  RiGlobalLine,
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const UBTS_POS = [0.3166, 32.5881];

const CONTACT_INFO = [
  { icon: RiMapPinLine, label: "Address",  value: "Plot 36 Nakasero Hill Road, Kampala, Uganda", href: null,           color: "#C41E3A" },
  { icon: RiPhoneLine,  label: "Phone",    value: "+256 414 347 980",                             href: "tel:+256414347980", color: "#8B1A1A" },
  { icon: RiMailLine,   label: "Email",    value: "info@ubts.go.ug",                              href: "mailto:info@ubts.go.ug", color: "#2c3e50" },
  { icon: RiGlobalLine, label: "Website",  value: "www.ubts.go.ug",                               href: "https://www.ubts.go.ug", color: "#D97706" },
];

const SUBJECTS = ["General Inquiry", "Blood Donation", "Partnership", "Technical Support"];

// ── Contact Form ─────────────────────────────────────────────────────────────────
function ContactForm() {
  const { dark } = useTheme();
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const FE = (f) => errors[f]
    ? <span style={{ fontSize: 11, color: "#DC2626", marginTop: 4, display: "block" }}>{errors[f]}</span>
    : null;

  const validate = () => {
    const e = {
      name:    v.name(form.name, "Full name"),
      email:   v.email(form.email),
      subject: form.subject ? null : "Please select a subject.",
      message: form.message.trim().length < 10
        ? "Message must be at least 10 characters."
        : v.maxLen(form.message, 1000, "Message"),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleChange  = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let err = null;
    if (name === "name")    err = v.name(value, "Full name");
    if (name === "email")   err = v.email(value);
    if (name === "message" && value) err = value.trim().length < 10 ? "Message must be at least 10 characters." : v.maxLen(value, 1000, "Message");
    setErrors((p) => ({ ...p, [name]: err }));
  };

  const handleSubmit  = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1000);
  };

  const fieldStyle = {
    width: "100%",
    borderRadius: 12,
    border: "1.5px solid var(--rh-border)",
    background: dark ? "#1E293B" : "#fff",
    padding: "12px 16px",
    fontSize: 14,
    color: "var(--ink)",
    fontFamily: "'Poppins',sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s",
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, borderRadius: 20, border: dark ? "1px solid rgba(16,185,129,.25)" : "1px solid #A7F3D0", background: dark ? "rgba(16,185,129,.1)" : "#ECFDF5", padding: "52px 32px", textAlign: "center" }}
      >
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RiCheckboxCircleLine size={34} style={{ color: "#059669" }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>Message Sent!</h3>
        <p style={{ maxWidth: 340, fontSize: 14, color: "var(--ink-s)", lineHeight: 1.75 }}>
          Thank you for reaching out. The UBTS team will get back to you within 1–2 business days at{" "}
          <strong style={{ color: "var(--ink)" }}>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
          style={{ borderRadius: 50, border: dark ? "1.5px solid rgba(16,185,129,.4)" : "1.5px solid #6EE7B7", padding: "10px 24px", fontSize: 13, fontWeight: 700, color: dark ? "#6EE7B7" : "#065F46", background: "none", cursor: "pointer" }}
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="rh-form-two-col">
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
            Full Name <span style={{ color: "var(--cr)" }}>*</span>
          </label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
            style={{ ...fieldStyle, ...(errors.name ? { borderColor: "#DC2626" } : {}) }}
            onFocus={e => (e.target.style.borderColor = "var(--cr)")}
            onBlur={handleBlur}
          />
          {FE("name")}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
            Email Address <span style={{ color: "var(--cr)" }}>*</span>
          </label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com"
            style={{ ...fieldStyle, ...(errors.email ? { borderColor: "#DC2626" } : {}) }}
            onFocus={e => (e.target.style.borderColor = "var(--cr)")}
            onBlur={handleBlur}
          />
          {FE("email")}
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
          Subject <span style={{ color: "var(--cr)" }}>*</span>
        </label>
        <select name="subject" value={form.subject} onChange={handleChange}
          style={{ ...fieldStyle, appearance: "auto", ...(errors.subject ? { borderColor: "#DC2626" } : {}) }}
          onFocus={e => (e.target.style.borderColor = "var(--cr)")}
          onBlur={e => (e.target.style.borderColor = "var(--rh-border)")}
        >
          <option value="" disabled>Select a subject…</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {FE("subject")}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
          Message <span style={{ color: "var(--cr)" }}>*</span>
        </label>
        <textarea name="message" rows={5} value={form.message} onChange={handleChange}
          placeholder="Write your message here… (10–1000 characters)"
          maxLength={1000}
          style={{ ...fieldStyle, resize: "none", ...(errors.message ? { borderColor: "#DC2626" } : {}) }}
          onFocus={e => (e.target.style.borderColor = "var(--cr)")}
          onBlur={handleBlur}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {FE("message")}
          <span style={{ fontSize: 10, color: form.message.length > 900 ? "#DC2626" : "var(--ink-l)", marginLeft: "auto" }}>
            {form.message.length}/1000
          </span>
        </div>
      </div>

      <button type="submit" disabled={sending}
        style={{ borderRadius: 50, background: "linear-gradient(135deg,var(--cr),var(--cr-dk))", color: "#fff", padding: "14px 0", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: sending ? 0.65 : 1, fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 16px rgba(196,30,58,.25)" }}>
        {sending ? (
          <><span style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Sending…</>
        ) : (
          <><RiSendPlaneLine size={16} /> Send Message</>
        )}
      </button>
    </form>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────
function Contact() {
  const { dark } = useTheme();
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: dark ? "#0F172A" : "#fff" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${reddyHero})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="rh-hero-overlay" />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 720, padding: "96px 28px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", padding: "8px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", backdropFilter: "blur(8px)", marginBottom: 22 }}>
              <RiDropLine size={13} /> Get in Touch
            </span>
            <h1 className="rh-display" style={{ fontSize: "clamp(32px,6vw,60px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>
              Contact{" "}
              <span style={{ color: "#FFB3C1" }}>Us</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", lineHeight: 1.75, maxWidth: 500, margin: "0 auto" }}>
              Have questions about blood donation, partnerships, or our platform? The UBTS team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 4 INFO CARDS ────────────────────────────────────────────────────── */}
      <section style={{ background: dark ? "#0F172A" : "#fff", padding: "72px 0 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rh-info-card">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon size={22} style={{ color: "#fff" }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-l)", marginBottom: 8 }}>{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>
                    {value}
                  </a>
                ) : (
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{value}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP + FORM ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 0 88px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div className="rh-two-col" style={{ gap: 32, alignItems: "stretch" }}>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rh-map-box"
              style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--rh-border)", minHeight: 480, boxShadow: "0 8px 32px rgba(0,0,0,.08)" }}
            >
              <MapContainer center={UBTS_POS} zoom={15} style={{ height: "100%", width: "100%", minHeight: 480 }} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={UBTS_POS}>
                  <Popup>
                    <strong>UBTS National Blood Transfusion Service</strong><br />
                    Plot 36, Nakasero Hill Road, Kampala
                  </Popup>
                </Marker>
              </MapContainer>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ borderRadius: 20, border: "1px solid var(--rh-border)", background: dark ? "#1E293B" : "#fff", padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,.07)" }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Message Us</p>
              <h2 className="rh-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Send Us a Message</h2>
              <p style={{ fontSize: 13.5, color: "var(--ink-s)", marginBottom: 28, lineHeight: 1.7 }}>
                Fill in the form below and we'll respond within 1–2 business days.
              </p>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
