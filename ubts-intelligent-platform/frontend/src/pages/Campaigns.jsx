import { useEffect, useRef, useState } from "react";
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

// ── Constants ─────────────────────────────────────────────────────────────────
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
  { name: "UBTS", subtitle: "Uganda Blood Transfusion Service", url: "https://www.ubts.go.ug" },
  { name: "MOH Uganda", subtitle: "Ministry of Health", url: "https://www.health.go.ug" },
  { name: "WHO Uganda", subtitle: "World Health Organization", url: "https://www.afro.who.int/countries/uganda" },
  { name: "Uganda Red Cross", subtitle: "Uganda Red Cross Society", url: "https://www.redcrossuganda.org" },
];
const SPONSORS_LOOP = [...SPONSORS, ...SPONSORS, ...SPONSORS];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CampaignCard({ camp, index }) {
  const img = CAMPAIGN_IMAGES[index % CAMPAIGN_IMAGES.length];
  const mapsUrl = camp.latitude && camp.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${camp.venue}, ${camp.district}, Uganda`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="relative h-[200px] overflow-hidden">
        <img src={img} alt={camp.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-red-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
          {camp.district}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${camp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-600"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${camp.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`} />
          {camp.status}
        </span>
        <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-50">{camp.name}</h3>
        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
          <RiMapPinLine size={15} className="mt-0.5 shrink-0 text-red-600" />
          <span>{camp.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <RiCalendarLine size={15} className="shrink-0 text-red-600" />
          <span>{fmtDate(camp.start_date)}{camp.end_date && camp.end_date !== camp.start_date ? ` – ${fmtDate(camp.end_date)}` : ""}</span>
        </div>
        {camp.contact_phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <RiPhoneLine size={15} className="shrink-0 text-red-600" />
            <a href={`tel:${camp.contact_phone}`} className="hover:text-red-700 hover:underline">{camp.contact_phone}</a>
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 pt-3">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800">
            <RiMapPinLine size={14} /> Get Directions
          </a>
          <Link to={`/camp-checkin/${camp.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-700 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20">
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SponsorCard({ sponsor }) {
  return (
    <div className="mx-3 flex min-w-[240px] flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
        <RiDropLine size={28} className="text-red-700" />
      </div>
      <p className="text-center text-base font-bold text-slate-900 dark:text-slate-50">{sponsor.name}</p>
      <p className="text-center text-xs text-slate-500">{sponsor.subtitle}</p>
      <a href={sponsor.url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline dark:text-red-400">
        Visit Website <RiExternalLinkLine size={11} />
      </a>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function Campaigns() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    getActiveCamps()
      .then((data) => setCamps(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load campaigns. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const totalWidth = track.scrollWidth / 3;
    const step = () => {
      posRef.current -= 0.5;
      if (Math.abs(posRef.current) >= totalWidth) posRef.current = 0;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "50vh" }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-700/30 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-red-300 backdrop-blur-sm">
              <RiDropLine size={14} /> Blood Donation Drives
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white lg:text-6xl">
              Active Campaigns <span className="text-red-400">Near You</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Find blood donation camps currently running across Uganda. Every donation saves up to three lives.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={() => document.getElementById("campaigns-list")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-red-800">
                <RiMapPinLine size={18} /> Browse Campaigns
              </button>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-7 py-3 font-semibold text-white transition hover:bg-white/10">
                Donor Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ALL CAMPAIGNS ────────────────────────────────────────────────── */}
      <section id="campaigns-list" className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="mb-3 inline-block rounded-full bg-red-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-red-700 dark:bg-red-950 dark:text-red-400">
                Donation Drives
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 lg:text-4xl">Currently Running Campaigns</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
                All active blood donation camps organised by UBTS and partner institutions across Uganda.
              </p>
            </motion.div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-500">
              <RiLoaderLine size={40} className="animate-spin text-red-700" />
              <p className="text-sm font-medium">Loading active campaigns…</p>
            </div>
          )}
          {!loading && error && (
            <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && camps.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <RiCalendarLine size={36} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No Active Campaigns</h3>
              <p className="max-w-sm text-sm text-slate-500">No active campaigns at the moment. Check back soon — new drives are added regularly across Uganda.</p>
            </div>
          )}
          {!loading && !error && camps.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {camps.map((camp, index) => <CampaignCard key={camp.id} camp={camp} index={index} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── SPONSORS ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-slate-100 py-16 dark:bg-slate-800">
        <div className="mx-auto mb-10 max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="mb-3 inline-block rounded-full bg-red-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-red-700 dark:bg-red-950 dark:text-red-400">
              Partners
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Our Partners & Sponsors</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              RedHope is proudly supported by institutions committed to saving lives in Uganda.
            </p>
          </motion.div>
        </div>
        <div className="overflow-hidden py-2">
          <div ref={trackRef} className="flex will-change-transform" style={{ width: "max-content" }}>
            {SPONSORS_LOOP.map((s, i) => <SponsorCard key={`${s.name}-${i}`} sponsor={s} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Campaigns;
