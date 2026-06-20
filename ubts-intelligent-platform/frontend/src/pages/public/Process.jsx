import { Link } from "react-router-dom";
import reddyHero from "../../assets/wallpapers/reddy.jpeg";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  RiAlertLine,
  RiArrowRightLine,
  RiBellLine,
  RiCupLine,
  RiDropLine,
  RiFilePdf2Line,
  RiGroupLine,
  RiHeartPulseLine,
  RiMapPinLine,
  RiRestTimeLine,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiUserAddLine,
} from "react-icons/ri";

// ── Data ────────────────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", icon: RiUserAddLine,    title: "Registration",         desc: "Sign up on RedHope with your personal details and create your verified donor profile in minutes.", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80" },
  { num: "02", icon: RiStethoscopeLine,title: "Health Screening",     desc: "Complete a brief health questionnaire powered by our AI eligibility engine to confirm you're ready to donate.", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80" },
  { num: "03", icon: RiHeartPulseLine, title: "Medical Check",        desc: "A qualified medical officer verifies your haemoglobin level, blood pressure, pulse, and weight on-site.", img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80" },
  { num: "04", icon: RiDropLine,       title: "Blood Collection",     desc: "The actual blood draw takes only 8–10 minutes using sterile, single-use equipment. Safe and painless.", img: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80" },
  { num: "05", icon: RiRestTimeLine,   title: "Post-Donation Rest",   desc: "Rest comfortably for 10–15 minutes. Our medical team monitors your vital signs before you leave.", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80" },
  { num: "06", icon: RiCupLine,        title: "Refreshments",         desc: "Enjoy juice, biscuits, and light snacks provided to help restore your energy and celebrate your contribution.", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
];

const BLOOD_FACTS = [
  { value: "1 Pint",  label: "Saves up to 3 Lives",      note: "A single whole blood donation can be separated into components that help multiple patients." },
  { value: "8–10 min",label: "Blood Draw Duration",      note: "The actual needle time is only 8–10 minutes. The full visit including check-in takes 45–60 min." },
  { value: "Every 2s",label: "Someone Needs Blood",       note: "Blood is perishable. Consistent donations are the only way to maintain safe hospital supply." },
  { value: "O−",      label: "Universal Donor Type",     note: "O-negative blood works for all blood types and is critical for emergency transfusions." },
];

const BEFORE_TIPS = [
  "Eat a nutritious, iron-rich meal 3 hours before donating",
  "Drink at least 500 ml of water before your appointment",
  "Get a full night of sleep (7–8 hours minimum)",
  "Avoid alcohol for at least 24 hours before donation",
  "Avoid fatty foods — they affect blood test accuracy",
  "Wear comfortable, loose-fitting clothing",
];

const AFTER_TIPS = [
  "Rest for 10–15 minutes at the donation site",
  "Drink extra fluids for the next 24–48 hours",
  "Avoid strenuous exercise or heavy lifting for 12 hours",
  "Keep the bandage on for at least 4 hours",
  "Eat iron-rich foods to help replenish red blood cells",
  "Notify staff immediately if you feel faint or dizzy",
];

const SERVICES = [
  { icon: RiShieldCheckLine, title: "Eligibility Screening",  desc: "AI-powered health assessment that checks your eligibility in seconds based on WHO guidelines." },
  { icon: RiGroupLine,       title: "Donor Matching",         desc: "Smart blood group and availability matching to connect donors with the most urgent needs." },
  { icon: RiMapPinLine,      title: "Camp Locator",           desc: "Real-time geolocation of active donation camps near your current location." },
  { icon: RiBellLine,        title: "Retention Alerts",       desc: "Personalised reminders and notifications when you become eligible to donate again." },
  { icon: RiFilePdf2Line,    title: "Donation Certificates",  desc: "Download your official PDF donation certificate to record and celebrate each contribution." },
  { icon: RiAlertLine,       title: "Blood Demand Alerts",    desc: "Instant notifications when your blood group is urgently needed at a facility near you." },
];

// ── Component ───────────────────────────────────────────────────────────────────
function Process() {
  const { dark } = useTheme();
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: dark ? "#0F172A" : "#fff" }}>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${reddyHero})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 780, padding: "96px 28px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 50, border: "1px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", padding: "8px 20px", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff", backdropFilter: "blur(8px)", marginBottom: 22 }}>
              <RiDropLine size={13} /> The Donation Process
            </span>
            <h1 className="rh-display" style={{ fontSize: "clamp(34px,6vw,64px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 18 }}>
              From Registration to{" "}
              <span style={{ color: "#FFB3C1" }}>Donation</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
              A simple, transparent process designed to make your donation experience seamless, safe, and impactful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── DONATION STEPS ──────────────────────────────────────────────────── */}
      <section style={{ background: dark ? "#0F172A" : "#fff", padding: "88px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Step by Step</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              The Donation Process
            </h2>
            <p style={{ maxWidth: 520, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              Here is exactly what happens from the moment you arrive at a donation camp.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="rh-process-card"
              >
                {/* Image with step number circle overlay */}
                <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                  <img src={step.img} alt={step.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s" }}
                    onMouseEnter={e => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.target.style.transform = "scale(1)")}
                  />
                  <div style={{ position: "absolute", bottom: -18, left: 22, width: 44, height: 44, borderRadius: "50%", background: "var(--cr)", border: dark ? "3px solid #1E293B" : "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <span className="rh-display" style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{step.num}</span>
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding: "32px 22px 24px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <step.icon size={20} style={{ color: "var(--cr)" }} />
                  </div>
                  <h3 className="rh-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--ink-s)", lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOOD FACTS ─────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "80px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Why It Matters</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              Blood Donation Facts
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 22 }}>
            {BLOOD_FACTS.map(({ value, label, note }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rh-achieve-card">
                <p className="rh-display" style={{ fontSize: 38, fontWeight: 800, color: "var(--cr)", lineHeight: 1, marginBottom: 6 }}>{value}</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 10 }}>{label}</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-s)", lineHeight: 1.7 }}>{note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER TIPS ─────────────────────────────────────────────── */}
      <section style={{ background: dark ? "#0F172A" : "#fff", padding: "80px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Preparation</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              Before &amp; After Donation Tips
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            {/* Before */}
            <div style={{ background: "var(--rh-canvas)", borderRadius: 20, padding: "32px", border: "1px solid var(--rh-border)" }}>
              <h3 className="rh-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 22 }}>
                <span style={{ color: "var(--cr)" }}>Before</span> Donation
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {BEFORE_TIPS.map((tip, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--ink-s)", lineHeight: 1.6 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--cr-xl)", color: "var(--cr)", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div style={{ background: dark ? "rgba(5,150,105,.12)" : "#F0FDF4", borderRadius: 20, padding: "32px", border: dark ? "1px solid rgba(16,185,129,.2)" : "1px solid #BBF7D0" }}>
              <h3 className="rh-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 22 }}>
                <span style={{ color: "#059669" }}>After</span> Donation
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {AFTER_TIPS.map((tip, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "var(--ink-s)", lineHeight: 1.6 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#D1FAE5", color: "#059669", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--rh-canvas)", padding: "80px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--cr)", marginBottom: 10 }}>Features</p>
            <h2 className="rh-display rh-underline" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: "var(--ink)" }}>
              Services We Provide
            </h2>
            <p style={{ maxWidth: 500, margin: "28px auto 0", fontSize: 14.5, color: "var(--ink-s)", lineHeight: 1.75 }}>
              RedHope is more than a registration form. Here is everything the platform does for you.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
            {SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}
                className="rh-service-item">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} style={{ color: "var(--cr)" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--ink-s)", lineHeight: 1.7 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,var(--cr) 0%,var(--cr-dk) 100%)", padding: "88px 28px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="rh-display" style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Ready to Make a Difference?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.85)", lineHeight: 1.75, marginBottom: 36 }}>
            Register on RedHope today and take your first step toward saving lives across Uganda.
          </p>
          <Link to="/register" style={{ borderRadius: 50, background: "#fff", color: "var(--cr-dk)", padding: "14px 36px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 8px 28px rgba(0,0,0,.18)" }}>
            Start Donating Today <RiArrowRightLine size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

export default Process;
