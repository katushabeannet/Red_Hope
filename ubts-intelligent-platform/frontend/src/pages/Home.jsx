import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RiArrowDownLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBrainLine,
  RiDropLine,
  RiFileCheckLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiLoaderLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiUserAddLine,
} from "react-icons/ri";

import { getPublicStats, getPublicCamps } from "../services/adminService";
import { findNearestCampFromChatbot } from "../services/chatbotService";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Data ────────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  { image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80", badge: "AI-Powered Platform", headline: "Save Lives Across", highlight: "Uganda." },
  { image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80", badge: "Smart Eligibility", headline: "Know Your Eligibility.", highlight: "Donate with Confidence." },
  { image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&q=80", badge: "Real-Time Alerts", headline: "Blood Needed Now.", highlight: "Be the Hero Someone Needs." },
  { image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1920&q=80", badge: "Find Nearby Camps", headline: "A Donation Camp", highlight: "Is Closer Than You Think." },
  { image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1920&q=80", badge: "Join Thousands", headline: "Your Blood Group.", highlight: "Their Second Chance." },
];

const BLOOD_TYPES = [
  { group: "O+",  level: "CRITICAL", urgent: true },
  { group: "A+",  level: "HIGH",     urgent: true },
  { group: "B+",  level: "MEDIUM",   urgent: false },
  { group: "AB-", level: "CRITICAL", urgent: true },
  { group: "O-",  level: "HIGH",     urgent: true },
  { group: "A-",  level: "MEDIUM",   urgent: false },
  { group: "B-",  level: "HIGH",     urgent: true },
  { group: "AB+", level: "MEDIUM",   urgent: false },
];
const BLOOD_LOOP = [...BLOOD_TYPES, ...BLOOD_TYPES];

const HOW_STEPS = [
  { icon: RiUserAddLine,   num: "01", title: "Register as a Donor",      desc: "Create your free account in under 2 minutes. Fill in your personal details and blood group." },
  { icon: RiFileCheckLine, num: "02", title: "Complete Health Profile",   desc: "Answer a brief health questionnaire. Our AI engine instantly checks your eligibility." },
  { icon: RiMapPinLine,    num: "03", title: "Get Matched to a Camp",     desc: "We find the closest active donation camp using real-time geospatial data." },
  { icon: RiHeartPulseLine,num: "04", title: "Donate & Track Impact",     desc: "Donate at the camp, earn badges, download your certificate, and see lives impacted." },
];

const DONORS = [
  { name: "Sarah Nakato",   group: "O+",  donations: 12, district: "Kampala", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
  { name: "James Otim",     group: "A+",  donations: 8,  district: "Gulu",    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80" },
  { name: "Grace Akinyi",   group: "B+",  donations: 15, district: "Wakiso",  photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&q=80" },
  { name: "Robert Ssempa",  group: "O-",  donations: 6,  district: "Jinja",   photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80" },
  { name: "Mary Namukasa",  group: "AB+", donations: 20, district: "Entebbe", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80" },
  { name: "David Okello",   group: "A-",  donations: 9,  district: "Mbale",   photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80" },
];

const FAQS = [
  { q: "Who can donate blood?", a: "Anyone aged 17 years and above, weighing at least 50 kg, and in good health can donate blood. You must not have donated in the past 3 months." },
  { q: "How often can I donate?", a: "You can donate whole blood every 3 months (approximately every 56 days). Regular donation is safe and highly encouraged." },
  { q: "Is blood donation safe?", a: "Absolutely. Every donation uses sterile, single-use equipment. There is zero risk of contracting any disease from donating blood." },
  { q: "How long does donation take?", a: "The entire process takes about 45–60 minutes, but the actual blood draw takes only 8–10 minutes. Screening and rest time make up the rest." },
  { q: "What should I do before donating?", a: "Eat a light, iron-rich meal, drink 500 ml of water, and get a good night's sleep. Avoid fatty foods and alcohol 24 hours before donation." },
  { q: "Does RedHope store my health data securely?", a: "Yes. All personal and health data is encrypted at rest and in transit. We comply with Uganda's data-protection guidelines and never share data without consent." },
];

// ── Map ─────────────────────────────────────────────────────────────────────────
function CampMap({ allCamps, nearestCamp }) {
  const center = nearestCamp
    ? [Number(nearestCamp.latitude), Number(nearestCamp.longitude)]
    : [1.3733, 32.2903];
  const zoom = nearestCamp ? 13 : 6;
  return (
    <MapContainer
      key={`${center[0]}-${center[1]}`}
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {allCamps.map((c) =>
        c.latitude && c.longitude ? (
          <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]}>
            <Popup><strong>{c.name}</strong><br />{c.venue}<br />{c.district}</Popup>
          </Marker>
        ) : null
      )}
      {nearestCamp?.latitude && nearestCamp?.longitude && (
        <Marker position={[Number(nearestCamp.latitude), Number(nearestCamp.longitude)]}>
          <Popup><strong>⭐ {nearestCamp.name}</strong><br />{nearestCamp.venue}<br />{nearestCamp.district}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────────
function Home() {
  const [stats, setStats]           = useState({});
  const [allCamps, setAllCamps]     = useState([]);
  const [heroIdx, setHeroIdx]       = useState(0);
  const [donorIdx, setDonorIdx]     = useState(0);
  const [openFaq, setOpenFaq]       = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [campLoading, setCampLoading] = useState(false);
  const [campError, setCampError]   = useState("");

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    getPublicCamps().then((d) => setAllCamps(d.camps || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDonorIdx((i) => (i + 1) % DONORS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[heroIdx];

  const handleFindCamp = () => {
    if (!navigator.geolocation) { setCampError("Geolocation is not supported by your browser."); return; }
    setCampLoading(true); setCampError(""); setNearestCamp(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await findNearestCampFromChatbot({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setNearestCamp(data.nearest_camp || null);
          if (!data.nearest_camp) setCampError("No active donation camps found nearby.");
        } catch {
          setCampError("No active camps found near your location. Try again later.");
        } finally { setCampLoading(false); }
      },
      () => { setCampError("Location access denied. Please allow location access."); setCampLoading(false); }
    );
  };

  const visibleDonors = [0, 1, 2].map((offset) => DONORS[(donorIdx + offset) % DONORS.length]);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#fff" }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              className="rh-hero-overlay"
              style={{ position: "absolute", inset: 0 }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.65 }}
              style={{ maxWidth: 780 }}
            >
              {/* Eyebrow badge */}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", padding: "8px 20px", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", backdropFilter: "blur(8px)", marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8314F" }} />
                {slide.badge}
              </span>

              {/* Headline */}
              <h1 className="rh-display" style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 8 }}>
                {slide.headline}{" "}
                <span style={{ color: "#FFB3C1" }}>{slide.highlight}</span>
              </h1>

              {/* Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 36 }}>
                <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, background: "linear-gradient(135deg, var(--cr), var(--cr-dk))", color: "#fff", padding: "14px 32px", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 28px rgba(196,30,58,.4)" }}>
                  Donate Now <RiArrowRightLine size={17} />
                </Link>
                <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "2px solid rgba(255,255,255,.7)", color: "#fff", padding: "14px 32px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                  Become a Donor
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next */}
        <button
          onClick={() => setHeroIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, borderRadius: "50%", background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.3)", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
        >
          <RiArrowLeftLine size={20} />
        </button>
        <button
          onClick={() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length)}
          style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, borderRadius: "50%", background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.3)", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
        >
          <RiArrowRightLine size={20} />
        </button>

        {/* Dots */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 8 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ height: 8, borderRadius: 4, background: i === heroIdx ? "#fff" : "rgba(255,255,255,.4)", width: i === heroIdx ? 28 : 8, border: "none", cursor: "pointer", transition: "all .3s" }} />
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 32, right: 32, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,255,255,.6)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", writingMode: "vertical-rl" }}>Scroll</span>
          <RiArrowDownLine size={14} />
        </div>
      </section>

      {/* ── 2. STATS ────────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", borderTop: "4px solid var(--cr)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid var(--rh-border)" }}>
            {[
              { icon: RiGroupLine,       value: stats.total_donors  ? stats.total_donors.toLocaleString()  : "5,000+",  label: "Registered Donors" },
              { icon: RiHeartPulseLine,  value: stats.active_donors ? stats.active_donors.toLocaleString() : "3,200+",  label: "Active Donors" },
              { icon: RiDropLine,        value: stats.units_donated ? stats.units_donated.toLocaleString() : "18,000+", label: "Units Donated" },
              { icon: RiShieldCheckLine, value: stats.lives_impacted ? stats.lives_impacted.toLocaleString() : "54,000+", label: "Lives Impacted" },
            ].map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="rh-stat-item"
                style={{
                  padding: "38px 24px",
                  textAlign: "center",
                  borderRight: i < 3 ? "1px solid var(--rh-border)" : "none",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon size={22} style={{ color: "var(--cr)" }} />
                </div>
                <p className="rh-display" style={{ fontSize: 42, fontWeight: 800, color: "var(--cr)", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 13, color: "var(--ink-l)", marginTop: 6, fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. URGENT NEEDS ─────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #1A1F2E 0%, #2d1a1a 100%)", padding: "72px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr-lt)", marginBottom: 10 }}>Live Updates</p>
            <h2 className="rh-display" style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
              These Blood Types Are{" "}
              <span style={{ color: "#FFB3C1" }}>Critically Needed</span>{" "}
              Right Now
            </h2>
          </div>
        </div>

        {/* Marquee track */}
        <div style={{ overflow: "hidden", padding: "12px 0" }}>
          <div className="animate-rh-marquee" style={{ display: "flex", gap: 16, width: "max-content" }}>
            {BLOOD_LOOP.map((bt, i) => (
              <div key={i} className={`rh-blood-card${bt.urgent ? " urgent" : ""}`}>
                <p className="rh-display" style={{ fontSize: 34, fontWeight: 800, color: bt.urgent ? "#FFB3C1" : "#fff", lineHeight: 1 }}>{bt.group}</p>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: bt.urgent ? "rgba(255,179,193,.7)" : "rgba(255,255,255,.5)", marginTop: 6 }}>{bt.level}</p>
                {bt.urgent && <span style={{ display: "block", width: 6, height: 6, borderRadius: "50%", background: "#E8314F", margin: "8px auto 0" }} className="animate-rh-pulse" />}
              </div>
            ))}
          </div>
        </div>

        {/* Open message strip */}
        <div style={{ maxWidth: 1200, margin: "40px auto 0", padding: "0 28px" }}>
          <div style={{ borderRadius: 16, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontWeight: 700, color: "#6EE7B7", fontSize: 14 }}>All blood types are always welcome</p>
              <p style={{ fontSize: 13, color: "rgba(110,231,183,.7)", marginTop: 4 }}>Even if your type isn't listed, UBTS needs A+, A−, B+, B−, AB+, AB−, O+, and O− daily.</p>
            </div>
            <Link to="/register" style={{ borderRadius: 50, background: "linear-gradient(135deg,#10B981,#065F46)", color: "#fff", padding: "11px 26px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              Register to Donate
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. HOW REDHOPE WORKS ────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Simple Process</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              How RedHope Works
            </h2>
            <p style={{ marginTop: 28, maxWidth: 560, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              From first registration to your donation certificate — RedHope makes every step effortless.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {HOW_STEPS.map(({ icon: Icon, num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rh-how-card"
                data-num={num}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={24} style={{ color: "var(--cr)" }} />
                </div>
                <h3 className="rh-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--ink-s)", lineHeight: 1.75 }}>{desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/process" style={{ color: "var(--cr)", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              See full donation process <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. FIND NEAREST CAMP ────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Near You</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              Find Your Nearest Blood Drive
            </h2>
            <p style={{ marginTop: 28, maxWidth: 560, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              No login required. All {allCamps.length > 0 ? allCamps.length : "active"} donation drives are pinned on the map.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <button
                onClick={handleFindCamp}
                disabled={campLoading}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 50, background: "linear-gradient(135deg,var(--cr),var(--cr-dk))", color: "#fff", padding: "14px 28px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(196,30,58,.28)", opacity: campLoading ? 0.65 : 1, width: "fit-content" }}
              >
                {campLoading ? (
                  <><RiLoaderLine size={18} style={{ animation: "spin 1s linear infinite" }} /> Locating…</>
                ) : (
                  <><RiMapPinLine size={18} /> Use My Location</>
                )}
              </button>

              {campError && (
                <div style={{ borderRadius: 14, border: "1px solid #FECDD3", background: "#FFF1F2", padding: "14px 18px", fontSize: 13, color: "var(--cr-dk)" }}>
                  {campError}
                </div>
              )}

              {nearestCamp && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ borderRadius: 16, border: "1px solid #A7F3D0", background: "#ECFDF5", padding: "20px" }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>⭐ Nearest Active Camp</p>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>{nearestCamp.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 4 }}>{nearestCamp.venue} · {nearestCamp.district}</p>
                  {nearestCamp.contact_phone && <p style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 4 }}>📞 {nearestCamp.contact_phone}</p>}
                </motion.div>
              )}

              <div style={{ borderRadius: 16, background: "var(--rh-canvas)", padding: "20px 22px" }}>
                <h4 style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 12 }}>How it works</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    `All ${allCamps.length > 0 ? allCamps.length : "active"} camps shown on map by default`,
                    'Click "Use My Location" to find the nearest one',
                    "No account needed — available to all visitors",
                  ].map((t, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: "var(--ink-s)" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", marginTop: 5, flexShrink: 0 }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Map */}
            <div style={{ height: 420, borderRadius: 20, overflow: "hidden", border: "1px solid var(--rh-border)", boxShadow: "0 12px 40px rgba(0,0,0,.1)" }}>
              <CampMap allCamps={allCamps} nearestCamp={nearestCamp} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DONOR RECOGNITION — KEPT AS-IS ───────────────────────────────── */}
      <section className="relative">
        {/* Image top */}
        <div className="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-red-900/70" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-300">Our Heroes</p>
              <h2 className="mt-1 text-3xl font-extrabold text-white lg:text-4xl">Meet Our Lifesaving Heroes</h2>
              <p className="mt-2 text-slate-200">Celebrating those who give the gift of life</p>
            </div>
          </div>
        </div>

        {/* White bottom */}
        <div className="bg-white pb-16 pt-32 dark:bg-slate-900" />

        {/* Floating cards */}
        <div className="absolute inset-x-0" style={{ top: "9rem" }}>
          <div className="mx-auto max-w-6xl px-6 lg:px-12">
            <div className="hidden gap-5 lg:grid lg:grid-cols-6">
              {DONORS.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-slate-800"
                >
                  <img src={d.photo} alt={d.name} className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-red-100" />
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{d.name}</p>
                  <span className="mt-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{d.group}</span>
                  <p className="mt-1 text-xs text-slate-500">{d.donations} donations</p>
                  <p className="text-xs text-slate-400">{d.district}</p>
                </motion.div>
              ))}
            </div>

            {/* Mobile: cycling 3 cards */}
            <div className="flex justify-center gap-4 lg:hidden">
              {visibleDonors.map((d) => (
                <div key={d.name} className="rounded-2xl bg-white p-4 text-center shadow-xl dark:bg-slate-800" style={{ minWidth: 120 }}>
                  <img src={d.photo} alt={d.name} className="mx-auto h-14 w-14 rounded-full object-cover ring-2 ring-red-100" />
                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{d.name}</p>
                  <span className="mt-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{d.group}</span>
                  <p className="text-xs text-slate-400">{d.donations} donations</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "88px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>FAQ</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 14 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--rh-border)", overflow: "hidden" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", flex: 1, textAlign: "left", lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ fontSize: 22, color: openFaq === i ? "var(--cr)" : "var(--ink-l)", marginLeft: 14, flexShrink: 0, display: "inline-block", transition: "transform .3s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div
                  style={{
                    maxHeight: openFaq === i ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height .4s ease",
                    padding: openFaq === i ? "0 24px 20px" : "0 24px",
                    fontSize: 13.5,
                    color: "var(--ink-s)",
                    lineHeight: 1.75,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,var(--cr) 0%,var(--cr-dk) 100%)", padding: "96px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 16 }}>Join the Movement</p>
            <h2 className="rh-display" style={{ fontSize: "clamp(28px,5vw,50px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 18 }}>
              Become Part of This Great Work
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.85)", lineHeight: 1.75, marginBottom: 36 }}>
              Join thousands of Ugandans saving lives every day through the gift of blood donation. One registration. Unlimited impact.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
              <Link to="/register" style={{ borderRadius: 50, background: "#fff", color: "var(--cr-dk)", padding: "14px 36px", fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 28px rgba(0,0,0,.2)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Join Us Today <RiArrowRightLine size={18} />
              </Link>
              <Link to="/campaigns" style={{ borderRadius: 50, border: "2px solid rgba(255,255,255,.6)", color: "#fff", padding: "14px 32px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                View Campaigns
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
