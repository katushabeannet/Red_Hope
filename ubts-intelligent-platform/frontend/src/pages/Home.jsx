import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBrainLine,
  RiDropLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiLoaderLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiUserAddLine,
  RiFileCheckLine,
  RiAddCircleLine,
  RiSubtractLine,
} from "react-icons/ri";

import { getPublicStats, getPublicCamps } from "../services/adminService";
import { findNearestCampFromChatbot } from "../services/chatbotService";

// Fix default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Data ─────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80",
    badge: "AI-Powered Platform",
    headline: "Save Lives Across Uganda.",
    highlight: "Every Drop Counts.",
  },
  {
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80",
    badge: "Smart Eligibility",
    headline: "Know Your Eligibility.",
    highlight: "Donate with Confidence.",
  },
  {
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&q=80",
    badge: "Real-Time Alerts",
    headline: "Blood Needed Now.",
    highlight: "Be the Hero Someone Needs.",
  },
  {
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1920&q=80",
    badge: "Find Nearby Camps",
    headline: "A Donation Camp",
    highlight: "Is Closer Than You Think.",
  },
  {
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1920&q=80",
    badge: "Join Thousands",
    headline: "Your Blood Group.",
    highlight: "Their Second Chance.",
  },
];

const URGENT_GROUPS = [
  { group: "O+", level: "CRITICAL", color: "bg-red-600" },
  { group: "A+", level: "URGENT", color: "bg-orange-500" },
  { group: "B+", level: "NEEDED", color: "bg-amber-500" },
  { group: "AB-", level: "CRITICAL", color: "bg-red-600" },
  { group: "O-", level: "URGENT", color: "bg-orange-500" },
  { group: "A-", level: "NEEDED", color: "bg-amber-500" },
];

const HOW_STEPS = [
  { icon: RiUserAddLine, num: "01", title: "Register as a Donor", desc: "Create your free account in under 2 minutes. Fill in your personal details and blood group." },
  { icon: RiFileCheckLine, num: "02", title: "Complete Your Health Profile", desc: "Answer a brief health questionnaire. Our AI engine instantly checks your eligibility." },
  { icon: RiMapPinLine, num: "03", title: "Get Matched to a Camp", desc: "We find the closest active donation camp to your location using real-time geospatial data." },
  { icon: RiHeartPulseLine, num: "04", title: "Donate & Track Impact", desc: "Donate at the camp, earn badges, download your certificate, and see lives you've impacted." },
];

const DONORS = [
  { name: "Sarah Nakato", group: "O+", donations: 12, district: "Kampala", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
  { name: "James Otim", group: "A+", donations: 8, district: "Gulu", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80" },
  { name: "Grace Akinyi", group: "B+", donations: 15, district: "Wakiso", photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&q=80" },
  { name: "Robert Ssempa", group: "O-", donations: 6, district: "Jinja", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80" },
  { name: "Mary Namukasa", group: "AB+", donations: 20, district: "Entebbe", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80" },
  { name: "David Okello", group: "A-", donations: 9, district: "Mbale", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80" },
];

const FAQS = [
  { q: "Who can donate blood?", a: "Anyone aged 17 years and above, weighing at least 50 kg, and in good health can donate blood. You must not have donated in the past 3 months." },
  { q: "How often can I donate?", a: "You can donate whole blood every 3 months (approximately every 56 days). Regular donation is safe and highly encouraged." },
  { q: "Is blood donation safe?", a: "Absolutely. Every donation uses sterile, single-use equipment. There is zero risk of contracting any disease from donating blood." },
  { q: "How long does donation take?", a: "The entire process takes about 45–60 minutes, but the actual blood draw takes only 8–10 minutes. Screening and rest time make up the rest." },
  { q: "What should I do before donating?", a: "Eat a light, iron-rich meal, drink 500ml of water, and get a good night's sleep. Avoid fatty foods and alcohol 24 hours before donation." },
  { q: "Does RedHope store my health data securely?", a: "Yes. All personal and health data is encrypted at rest and in transit. We comply with Uganda's data protection guidelines and never share data without consent." },
];

// ── Map wrapper (lazy-render) ─────────────────────────────────────────────────
function CampMap({ allCamps, nearestCamp }) {
  const center = nearestCamp
    ? [Number(nearestCamp.latitude), Number(nearestCamp.longitude)]
    : [1.3733, 32.2903];
  const zoom = nearestCamp ? 13 : 6;

  return (
    <MapContainer key={`${center[0]}-${center[1]}`} center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full rounded-2xl">
      <TileLayer attribution="© OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {allCamps.map((c) =>
        c.latitude && c.longitude ? (
          <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]}>
            <Popup><strong>{c.name}</strong><br />{c.venue}<br />{c.district}</Popup>
          </Marker>
        ) : null
      )}
      {nearestCamp && nearestCamp.latitude && nearestCamp.longitude && (
        <Marker position={[Number(nearestCamp.latitude), Number(nearestCamp.longitude)]}>
          <Popup><strong>⭐ {nearestCamp.name}</strong><br />{nearestCamp.venue}<br />{nearestCamp.district}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function Home() {
  const [stats, setStats] = useState({});
  const [allCamps, setAllCamps] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [urgentIdx, setUrgentIdx] = useState(0);
  const [donorIdx, setDonorIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [nearestCamp, setNearestCamp] = useState(null);
  const [campLoading, setCampLoading] = useState(false);
  const [campError, setCampError] = useState("");

  // Load stats + camps
  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    getPublicCamps().then((d) => setAllCamps(d.camps || [])).catch(() => {});
  }, []);

  // Hero auto-slide
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Urgent needs cycle
  useEffect(() => {
    const t = setInterval(() => setUrgentIdx((i) => (i + 1) % URGENT_GROUPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  // Donor recognition cycle
  useEffect(() => {
    const t = setInterval(() => setDonorIdx((i) => (i + 1) % DONORS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[heroIdx];
  const urgent = URGENT_GROUPS[urgentIdx];

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
    <div className="bg-white dark:bg-slate-900">

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/55" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {slide.badge}
              </span>
              <h1 className="text-5xl font-extrabold leading-tight text-white lg:text-7xl">
                {slide.headline}{" "}
                <span className="text-red-400">{slide.highlight}</span>
              </h1>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-red-700">
                  Donate Now <RiArrowRightLine size={18} />
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-base font-bold text-white transition hover:bg-white/10">
                  Become a Donor
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next */}
        <button onClick={() => setHeroIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/40">
          <RiArrowLeftLine size={22} />
        </button>
        <button onClick={() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/40">
          <RiArrowRightLine size={22} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`h-2.5 rounded-full transition-all ${i === heroIdx ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />
          ))}
        </div>
      </section>

      {/* ── 2. SUMMARY STATS ─────────────────────────────────────────────── */}
      <section className="bg-red-700 py-14 dark:bg-red-800">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: RiGroupLine, value: stats.total_donors ? stats.total_donors.toLocaleString() : "5,000+", label: "Registered Donors" },
              { icon: RiHeartPulseLine, value: stats.active_donors ? stats.active_donors.toLocaleString() : "3,200+", label: "Active Donors" },
              { icon: RiDropLine, value: stats.units_donated ? stats.units_donated.toLocaleString() : "18,000+", label: "Units Donated" },
              { icon: RiShieldCheckLine, value: stats.lives_impacted ? stats.lives_impacted.toLocaleString() : "12,000+", label: "Lives Impacted" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Icon size={24} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white lg:text-4xl">{value}</p>
                <p className="mt-1 text-sm text-red-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. URGENT NEEDS ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Live Updates</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">Urgent Blood Needs</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Cycling urgency */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-10 dark:border-red-800 dark:bg-red-950/20">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Currently Most Needed</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={urgentIdx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-5xl font-black text-white shadow-2xl shadow-red-300">
                    {urgent.group}
                  </div>
                  <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white ${urgent.color}`}>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    {urgent.level}
                  </span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {URGENT_GROUPS.map((g, i) => (
                  <span key={g.group} className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition ${i === urgentIdx ? g.color + " scale-110" : "bg-slate-300"}`}>
                    {g.group}
                  </span>
                ))}
              </div>
            </div>

            {/* Static info */}
            <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-8 dark:bg-slate-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <RiHeartPulseLine size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Blood Groups Welcome</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Even if your blood group isn't listed as critical, your donation is still urgently needed. UBTS accepts all blood types — A+, A-, B+, B-, AB+, AB-, O+, and O-.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Regular donations ensure a healthy blood bank supply that saves lives every day across Uganda. Every unit matters.
              </p>
              <Link to="/register" className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700">
                Register to Donate <RiArrowRightLine size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HOW REDHOPE WORKS ─────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Simple Process</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">How RedHope Works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              From first registration to your donation certificate — RedHope makes every step effortless.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(({ icon: Icon, num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
                  <Icon size={24} className="text-red-700" />
                </div>
                <span className="absolute right-4 top-4 text-5xl font-black text-slate-100 dark:text-slate-800">{num}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/process" className="inline-flex items-center gap-2 font-semibold text-red-700 hover:underline dark:text-red-400">
              See full donation process <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. FIND NEAREST DRIVE ────────────────────────────────────────── */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Near You</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">Find Your Nearest Blood Donation Drive</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              No login required. All {allCamps.length > 0 ? allCamps.length : "active"} donation drives are pinned on the map. Use your location to find the nearest one.
            </p>
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-2">
            {/* Controls */}
            <div className="space-y-5">
              <button
                onClick={handleFindCamp}
                disabled={campLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-red-800 disabled:opacity-60"
              >
                {campLoading ? <><RiLoaderLine className="animate-spin" size={18} /> Locating…</> : <><RiMapPinLine size={18} /> Use My Location</>}
              </button>

              {campError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {campError}
                </div>
              )}

              {nearestCamp && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">⭐ Nearest Active Camp</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{nearestCamp.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{nearestCamp.venue} · {nearestCamp.district}</p>
                  {nearestCamp.contact_phone && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">📞 {nearestCamp.contact_phone}</p>
                  )}
                </motion.div>
              )}

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white">How it works</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> All {allCamps.length > 0 ? allCamps.length : "active"} camps shown on map by default</li>
                  <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Click "Use My Location" to find the nearest one</li>
                  <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> No account needed — available to all visitors</li>
                </ul>
              </div>
            </div>

            {/* Map */}
            <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-700">
              <CampMap allCamps={allCamps} nearestCamp={nearestCamp} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DONOR RECOGNITION ─────────────────────────────────────────── */}
      <section className="relative">
        {/* Image top */}
        <div className="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-red-900/70" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-300">Our Heroes</p>
              <h2 className="mt-1 text-3xl font-extrabold text-white lg:text-4xl">Recognized Donors</h2>
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

      {/* ── 7. FAQ ───────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">FAQ</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-900 dark:text-white"
                >
                  {faq.q}
                  {openFaq === i ? <RiSubtractLine size={18} className="text-red-600 flex-shrink-0" /> : <RiAddCircleLine size={18} className="text-slate-400 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-slate-100 px-6 pb-5 pt-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. BECOME PART ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-red-200">Join the Movement</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white lg:text-5xl">Become Part of This Great Work</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-red-100">
              Join thousands of Ugandans saving lives every day through the gift of blood donation. One registration. Unlimited impact.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-10 py-4 text-base font-bold text-red-700 shadow-xl transition hover:bg-red-50"
            >
              Join Us Today <RiArrowRightLine size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
