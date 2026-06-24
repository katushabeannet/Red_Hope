import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reddyHero    from "../../assets/wallpapers/reddy.jpeg";
import { useTheme } from "../../context/ThemeContext";
import albertPhoto  from "../../assets/team/Albert.jpeg";
import annetPhoto   from "../../assets/team/Annet-cropped.jpeg";
import yakubPhoto   from "../../assets/team/kubi.jpg";
import wilfredPhoto from "../../assets/team/wilfred1.jpg";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiDropLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiUserSmileLine,
  RiAwardLine,
} from "react-icons/ri";
import { getPlatinumDonors } from "../../services/donorService";

// ── Data ────────────────────────────────────────────────────────────────────────
const TEAM = [
  { name: "Nuwarinda Albert",   photo: albertPhoto,  role: "Developer",                  dept: "Lead Developer & AI Engineer", color: "#C41E3A" },
  { name: "Okwii Yakub",        photo: yakubPhoto,   role: "Developer",                  dept: "Backend Engineering",          color: "#8B1A1A" },
  { name: "Katswamba Wilfred",  photo: wilfredPhoto, role: "Developer",                  dept: "Frontend & UI Design",         color: "#2c3e50" },
  { name: "Katushabe Annet",    photo: annetPhoto,   role: "Developer & System Analyst", dept: "Systems Analysis",             color: "#D97706" },
];

const TIERS = {
  Platinum: { label: "Platinum", min: 20, bg: "linear-gradient(135deg,#5B21B6,#7C3AED)", accent: "#7C3AED" },
  Gold:     { label: "Gold",     min: 10, bg: "linear-gradient(135deg,#B45309,#D97706)", accent: "#D97706" },
  Silver:   { label: "Silver",   min: 5,  bg: "linear-gradient(135deg,#475569,#94A3B8)", accent: "#94A3B8" },
};

function getDonorTier(donations) {
  if (donations >= 20) return TIERS.Platinum;
  if (donations >= 10) return TIERS.Gold;
  return TIERS.Silver;
}

const RECOG_DONORS = [
  { name: "Sarah Nakato",  initials: "SN", group: "O+",  donations: 24, district: "Kampala" },
  { name: "James Otim",    initials: "JO", group: "A+",  donations: 18, district: "Gulu"    },
  { name: "Grace Akinyi",  initials: "GA", group: "B+",  donations: 20, district: "Wakiso"  },
  { name: "Robert Ssempa", initials: "RS", group: "O-",  donations: 12, district: "Jinja"   },
  { name: "Mary Namukasa", initials: "MN", group: "AB+", donations: 28, district: "Entebbe" },
  { name: "David Okello",  initials: "DO", group: "A-",  donations:  7, district: "Mbale"   },
];

const ACHIEVEMENTS = [
  { icon: RiUserSmileLine,  value: "12,000+", label: "Success Smiles"    },
  { icon: RiGroupLine,      value: "5,000+",  label: "Happy Donors"      },
  { icon: RiAwardLine,      value: "8",       label: "Total Awards"      },
  { icon: RiHeartPulseLine, value: "15,000+", label: "Happy Recipients"  },
];


// ── Component ───────────────────────────────────────────────────────────────────
function About() {
  const { dark } = useTheme();
  const [platinumDonors, setPlatinumDonors] = useState(null);

  useEffect(() => {
    getPlatinumDonors()
      .then((data) => { if (data.donors?.length > 0) setPlatinumDonors(data.donors); })
      .catch(() => {});
  }, []);

  const displayDonors = platinumDonors ?? RECOG_DONORS;
  const displayDonors2 = [...displayDonors, ...displayDonors];

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: dark ? "#0F172A" : "#fff" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${reddyHero})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="rh-hero-overlay" />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 780, padding: "96px 28px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", padding: "8px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", backdropFilter: "blur(8px)", marginBottom: 22 }}>
              <RiDropLine size={13} /> About RedHope
            </span>
            <h1 className="rh-display" style={{ fontSize: "clamp(34px,6vw,64px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>
              Saving Lives,{" "}
              <span style={{ color: "#FFB3C1" }}>One Drop at a Time</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
              Discover the people, mission, and technology behind RedHope — Uganda's intelligent blood donation platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ──────────────────────────────────────────────────────── */}
      <section style={{ background: dark ? "#0F172A" : "#fff", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div className="rh-two-col" style={{ gap: 60, alignItems: "center" }}>
            {/* Text card */}
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ background: dark ? "#1E293B" : "#fff", borderRadius: 20, padding: "44px", boxShadow: "0 8px 40px rgba(0,0,0,.08)", border: "1px solid var(--rh-border)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 12 }}>Our Story</p>
                <h2 className="rh-display" style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: "var(--ink)", marginBottom: 28 }}>Who We Are</h2>
                <div style={{ borderLeft: "4px solid var(--cr)", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.8 }}>
                    RedHope is an AI-powered intelligent blood donation management system developed by a team of Makerere University final-year students as part of their capstone project.
                  </p>
                  <p style={{ fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.8 }}>
                    Our mission is to bridge the gap between blood donors and recipients across Uganda using machine learning, geospatial technology, and real-time data to make blood donation seamless and impactful.
                  </p>
                  <p style={{ fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.8 }}>
                    We believe every person deserves timely access to safe blood. RedHope makes this possible through smart donor matching, eligibility screening, and personalized donation reminders.
                  </p>
                </div>
                <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 32, borderRadius: 50, background: "linear-gradient(135deg,var(--cr),var(--cr-dk))", color: "#fff", padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  Join Us Today <RiArrowRightLine size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 56px rgba(0,0,0,.14)" }}>
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80" alt="RedHope Team"
                style={{ width: "100%", height: 440, objectFit: "cover", display: "block" }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DONOR RECOGNITION ───────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Background image layer */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(139,26,26,.88)" }} />

        <div style={{ position: "relative", zIndex: 1, padding: "80px 0 72px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,179,193,.8)", marginBottom: 10 }}>Our Heroes</p>
            <h2 className="rh-display" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "#fff" }}>Recognized Donors</h2>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.75)", marginTop: 10, marginBottom: 28 }}>
              Celebrating those who give the gift of life
            </p>
            {/* Tier legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
              {Object.values(TIERS).map((t) => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.bg, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>
                    {t.label} <span style={{ fontWeight: 400, color: "rgba(255,255,255,.55)" }}>{t.min}+ donations</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee */}
          <div style={{ overflow: "hidden", padding: "8px 0" }}>
            <div className="animate-rh-marquee" style={{ display: "flex", gap: 20, width: "max-content" }}>
              {displayDonors2.map((donor, i) => {
                const tier = getDonorTier(donor.donations);
                return (
                  <div key={i} className="rh-recog-card">
                    {/* Initials panel — tier gradient */}
                    <div style={{ height: 170, background: tier.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span className="rh-display" style={{ fontSize: 52, fontWeight: 800, color: "#fff", opacity: 0.9 }}>{donor.initials}</span>
                      {/* Tier badge */}
                      <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", color: "#fff", borderRadius: 50, padding: "3px 10px", fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
                        {tier.label}
                      </span>
                    </div>
                    {/* Info */}
                    <div style={{ padding: "14px 18px 18px", textAlign: "center" }}>
                      <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink)" }}>{donor.name}</p>
                      <div style={{ width: 32, height: 2, background: tier.accent, margin: "10px auto 8px", borderRadius: 2 }} />
                      <p style={{ fontSize: 10.5, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".04em" }}>{tier.label} Donor</p>
                      <p style={{ fontSize: 10.5, color: "var(--ink-l)", marginTop: 2 }}>{donor.district}</p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--cr-xl)", color: "var(--cr)", borderRadius: 50, padding: "3px 10px", fontSize: 11, fontWeight: 700, marginTop: 10 }}>
                        ❤ {donor.donations} Donations
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link to="/register" style={{ borderRadius: 50, border: "2px solid rgba(255,255,255,.7)", color: "#fff", padding: "13px 36px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Become a Donor
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACHIEVEMENTS ────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "88px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Impact</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>Our Achievements</h2>
            <p style={{ maxWidth: 500, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              Since launching in 2024, RedHope has transformed blood donation management across Uganda.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
            {ACHIEVEMENTS.map(({ icon: Icon, value, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rh-achieve-card">
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon size={24} style={{ color: "var(--cr)" }} />
                </div>
                <p className="rh-display" style={{ fontSize: 40, fontWeight: 800, color: "var(--cr)", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 13, color: "var(--ink-l)", marginTop: 8, fontWeight: 500 }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ────────────────────────────────────────────────────────────── */}
      <section style={{ background: dark ? "#0F172A" : "#fff", padding: "88px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Meet the Builders</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>The Minds Behind RedHope</h2>
            <p style={{ maxWidth: 520, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              A passionate team of Makerere University students dedicated to solving Uganda's blood shortage crisis.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {TEAM.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rh-team-card">
                {/* Team photo */}
                <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
                  <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,31,46,.75) 0%, transparent 55%)" }} />
                  <span style={{ position: "absolute", bottom: 12, left: 14, background: member.color, color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {member.dept}
                  </span>
                </div>
                {/* Info bottom */}
                <div style={{ padding: "18px 20px", textAlign: "center" }}>
                  <div style={{ width: 32, height: 2, background: "var(--cr)", margin: "0 auto 12px", borderRadius: 2 }} />
                  <p style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>{member.name}</p>
                  <p style={{ fontSize: 12, color: "var(--ink-l)", marginTop: 4 }}>{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US SPLIT ────────────────────────────────────────────────────── */}
      <section>
        <div className="rh-two-col">
          {/* Image left */}
          <div style={{ position: "relative", minHeight: 380, overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=900&q=80" alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(26,31,46,.3)" }} />
          </div>

          {/* Text right */}
          <div className="rh-join-panel" style={{ background: dark ? "#0A0F1E" : "#F7F8FC", display: "flex", alignItems: "center", padding: "60px 50px" }}>
            <div style={{ maxWidth: 420 }}>
              <div style={{ background: dark ? "#1E293B" : "#fff", borderRadius: 20, padding: "40px", boxShadow: "0 8px 32px rgba(0,0,0,.07)", border: "1px solid var(--rh-border)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Get Started</p>
                <h2 className="rh-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", lineHeight: 1.2, marginBottom: 16 }}>Join Us and Save a Life</h2>
                <p style={{ fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.8, marginBottom: 28 }}>
                  Become part of a growing community of Ugandans saving lives through blood donation. Register on RedHope today and make your first contribution.
                </p>
                <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, background: "linear-gradient(135deg,var(--cr),var(--cr-dk))", color: "#fff", padding: "13px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(196,30,58,.28)" }}>
                  Register Now <RiArrowRightLine size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
