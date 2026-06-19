import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiCalendarLine,
  RiDropLine,
  RiExternalLinkLine,
  RiLoaderLine,
  RiMapPinLine,
  RiPhoneLine,
} from "react-icons/ri";

import { getActiveCamps } from "../services/donorService";

// ── Constants ───────────────────────────────────────────────────────────────────
const CAMPAIGN_IMAGES = [
  "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80",
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&q=80",
  "https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=600&q=80",
];

const SPONSORS = [
  { name: "UBTS",          subtitle: "Uganda Blood Transfusion Service",    url: "https://www.ubts.go.ug" },
  { name: "MOH Uganda",    subtitle: "Ministry of Health",                  url: "https://www.health.go.ug" },
  { name: "WHO Uganda",    subtitle: "World Health Organization",           url: "https://www.afro.who.int/countries/uganda" },
  { name: "Uganda Red Cross", subtitle: "Uganda Red Cross Society",        url: "https://www.redcrossuganda.org" },
];

const FILTERS = ["All", "Active Now", "Upcoming"];

// ── Helpers ─────────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Sub-components ───────────────────────────────────────────────────────────────
function CampItem({ camp, index }) {
  const img = CAMPAIGN_IMAGES[index % CAMPAIGN_IMAGES.length];
  const mapsUrl = camp.latitude && camp.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${camp.venue}, ${camp.district}, Uganda`)}`;

  const isActive = camp.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="rh-camp-item"
    >
      {/* Image (left) */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        <img src={img} alt={camp.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s" }}
          onMouseEnter={e => (e.target.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.target.style.transform = "scale(1)")}
        />
        <span style={{ position: "absolute", top: 12, left: 12, background: "var(--cr)", color: "#fff", borderRadius: 4, padding: "2px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
          {camp.district}
        </span>
      </div>

      {/* Text (right) */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
        {/* Status badge */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, width: "fit-content", background: isActive ? "#D1FAE5" : "#FEF3C7", color: isActive ? "#065F46" : "#92400E", borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "#10B981" : "#D97706" }} />
          {isActive ? "Active Now" : "Upcoming"}
        </span>

        {/* Name */}
        <h3 className="rh-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", lineHeight: 1.25 }}>{camp.name}</h3>

        {/* Details */}
        <p style={{ fontSize: 13, color: "var(--ink-s)", display: "flex", alignItems: "flex-start", gap: 6 }}>
          <RiMapPinLine size={14} style={{ color: "var(--cr)", marginTop: 2, flexShrink: 0 }} /> {camp.venue}
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-s)", display: "flex", alignItems: "center", gap: 6 }}>
          <RiCalendarLine size={14} style={{ color: "var(--cr)", flexShrink: 0 }} />
          {fmtDate(camp.start_date)}{camp.end_date && camp.end_date !== camp.start_date ? ` – ${fmtDate(camp.end_date)}` : ""}
        </p>
        {camp.contact_phone && (
          <p style={{ fontSize: 13, color: "var(--ink-s)", display: "flex", alignItems: "center", gap: 6 }}>
            <RiPhoneLine size={14} style={{ color: "var(--cr)", flexShrink: 0 }} />
            <a href={`tel:${camp.contact_phone}`} style={{ color: "inherit", textDecoration: "none" }}>{camp.contact_phone}</a>
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, background: "var(--cr)", color: "#fff", borderRadius: 6, padding: "9px 0", textAlign: "center", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <RiMapPinLine size={13} /> Directions
          </a>
          <Link to={`/camp-checkin/${camp.id}`}
            style={{ flex: 1, border: "1.5px solid var(--cr)", color: "var(--cr)", borderRadius: 6, padding: "9px 0", textAlign: "center", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────
function Campaigns() {
  const [camps, setCamps]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeFilter, setFilter] = useState("All");

  useEffect(() => {
    getActiveCamps()
      .then((data) => setCamps(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load campaigns. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = camps.filter((c) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active Now") return c.status === "ACTIVE";
    if (activeFilter === "Upcoming") return c.status !== "ACTIVE";
    return true;
  });

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#fff" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "58vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="rh-hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 780, padding: "96px 28px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", padding: "8px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", backdropFilter: "blur(8px)", marginBottom: 22 }}>
              <RiDropLine size={13} /> Blood Donation Drives
            </span>
            <h1 className="rh-display" style={{ fontSize: "clamp(34px,6vw,64px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>
              Active Campaigns{" "}
              <span style={{ color: "#FFB3C1" }}>Near You</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", lineHeight: 1.75, maxWidth: 540, margin: "0 auto 36px" }}>
              Find blood donation camps currently running across Uganda. Every donation saves up to three lives.
            </p>
            <button
              onClick={() => document.getElementById("campaigns-list")?.scrollIntoView({ behavior: "smooth" })}
              style={{ borderRadius: 50, background: "linear-gradient(135deg,var(--cr),var(--cr-dk))", color: "#fff", padding: "14px 32px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(196,30,58,.35)" }}
            >
              Browse Campaigns
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── ALL CAMPAIGNS ───────────────────────────────────────────────────── */}
      <section id="campaigns-list" style={{ background: "#fff", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          {/* Header + filter */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 44 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Donation Drives</p>
              <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: "var(--ink)" }}>
                All Campaigns
              </h2>
            </div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8 }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ borderRadius: 50, padding: "8px 20px", fontSize: 13, fontWeight: 600, border: "1.5px solid", cursor: "pointer", transition: "all .2s",
                    background: activeFilter === f ? "var(--cr)" : "#fff",
                    color: activeFilter === f ? "#fff" : "var(--ink-s)",
                    borderColor: activeFilter === f ? "var(--cr)" : "var(--rh-border)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "80px 0" }}>
              <RiLoaderLine size={40} style={{ color: "var(--cr)", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 14, color: "var(--ink-l)" }}>Loading active campaigns…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ maxWidth: 480, margin: "0 auto", borderRadius: 16, border: "1px solid #FECDD3", background: "#FFF1F2", padding: "24px", textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: "var(--cr)" }}>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--rh-canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RiCalendarLine size={36} style={{ color: "var(--ink-l)" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>No {activeFilter === "All" ? "" : activeFilter + " "}Campaigns</h3>
              <p style={{ maxWidth: 380, fontSize: 13.5, color: "var(--ink-s)", lineHeight: 1.7 }}>
                {activeFilter === "All"
                  ? "No active campaigns at the moment. Check back soon."
                  : `No ${activeFilter.toLowerCase()} campaigns found. Try a different filter.`}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(480px,1fr))", gap: 20 }}>
              {filtered.map((camp, index) => (
                <CampItem key={camp.id} camp={camp} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SPONSORS ────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "80px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Partners</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: "var(--ink)" }}>
              Our Partners &amp; Sponsors
            </h2>
            <p style={{ maxWidth: 500, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              RedHope is proudly supported by institutions committed to saving lives in Uganda.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 22 }}>
            {SPONSORS.map((s) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rh-sponsor-card">
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <RiDropLine size={28} style={{ color: "var(--cr)" }} />
                </div>
                <p className="rh-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>{s.name}</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-l)", lineHeight: 1.5, marginBottom: 14 }}>{s.subtitle}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 700, color: "var(--cr)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Visit Website <RiExternalLinkLine size={12} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Campaigns;
