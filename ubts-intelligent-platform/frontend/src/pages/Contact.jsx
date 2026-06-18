import { useState } from "react";
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

// Fix Leaflet default marker icons (Vite asset-handling workaround)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const UBTS_POS = [0.3166, 32.5881];

const CONTACT_INFO = [
  { icon: RiMapPinLine, label: "Address", value: "Plot 36 Nakasero Hill Road, Kampala, Uganda", href: null },
  { icon: RiPhoneLine, label: "Phone", value: "+256 414 347 980", href: "tel:+256414347980" },
  { icon: RiMailLine, label: "Email", value: "info@ubts.go.ug", href: "mailto:info@ubts.go.ug" },
  { icon: RiGlobalLine, label: "Website", value: "www.ubts.go.ug", href: "https://www.ubts.go.ug" },
];

const SUBJECTS = ["General Inquiry", "Blood Donation", "Partnership", "Technical Support"];

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-red-500 dark:focus:ring-red-900/40";

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1000);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-800 dark:bg-emerald-950/20"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <RiCheckboxCircleLine size={36} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Message Sent!</h3>
        <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Thank you for reaching out. The UBTS team will get back to you within 1–2 business days at{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-50">{form.email}</span>.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
          className="rounded-xl border border-emerald-300 px-6 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name <span className="text-red-600">*</span></label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="John Doe" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-600">*</span></label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="john@example.com" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Subject <span className="text-red-600">*</span></label>
        <select name="subject" required value={form.subject} onChange={handleChange} className={inputCls}>
          <option value="" disabled>Select a subject…</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Message <span className="text-red-600">*</span></label>
        <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
          placeholder="Write your message here…" className={`${inputCls} resize-none`} />
      </div>
      <button type="submit" disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-red-800 disabled:opacity-60">
        {sending ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending…</>
        ) : (
          <><RiSendPlaneLine size={17} /> Send Message</>
        )}
      </button>
    </form>
  );
}

function Contact() {
  return (
    <div className="bg-white dark:bg-slate-900">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "50vh" }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-700/30 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-red-300 backdrop-blur-sm">
              <RiDropLine size={14} /> Get in Touch
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white lg:text-6xl">
              Contact <span className="text-red-400">Us</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Have questions about blood donation, partnerships, or our platform? The UBTS team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT INFO STRIP ───────────────────────────────────────────── */}
      <section className="bg-white py-12 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
                  <Icon size={22} className="text-red-700" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-900 hover:text-red-700 hover:underline dark:text-slate-50">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP + FORM ───────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 dark:bg-slate-800 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700"
              style={{ height: 450 }}
            >
              <MapContainer center={UBTS_POS} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
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
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-7">
                <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-700 dark:bg-red-950 dark:text-red-400">
                  Message Us
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Send Us a Message</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fill in the form below and we'll respond within 1–2 business days.</p>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
