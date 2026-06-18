import { Link } from "react-router-dom";
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

// ── Data ─────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: RiUserAddLine,
    title: "Registration",
    desc: "Sign up on RedHope with your personal details and create your verified donor profile in minutes.",
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
  },
  {
    num: "02",
    icon: RiStethoscopeLine,
    title: "Health Screening",
    desc: "Complete a brief health questionnaire powered by our AI eligibility engine to confirm you're ready to donate.",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  },
  {
    num: "03",
    icon: RiHeartPulseLine,
    title: "Medical Check",
    desc: "A qualified medical officer verifies your hemoglobin level, blood pressure, pulse, and weight on-site.",
    img: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80",
  },
  {
    num: "04",
    icon: RiDropLine,
    title: "Blood Collection",
    desc: "The actual blood draw takes only 8–10 minutes using sterile, single-use equipment. Safe and painless.",
    img: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80",
  },
  {
    num: "05",
    icon: RiRestTimeLine,
    title: "Post-Donation Rest",
    desc: "Rest comfortably for 10–15 minutes. Our medical team monitors your vital signs before you leave.",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
  },
  {
    num: "06",
    icon: RiCupLine,
    title: "Refreshments",
    desc: "Enjoy juice, biscuits, and light snacks provided to help restore your energy and celebrate your contribution.",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  },
];

const SERVICES = [
  { icon: RiShieldCheckLine, title: "Eligibility Screening", desc: "AI-powered health assessment that checks your eligibility in seconds based on WHO guidelines." },
  { icon: RiGroupLine, title: "Donor Matching", desc: "Smart blood group and availability matching to connect donors with the most urgent needs." },
  { icon: RiMapPinLine, title: "Camp Locator", desc: "Real-time geolocation of active donation camps near your current location." },
  { icon: RiBellLine, title: "Retention Alerts", desc: "Personalized reminders and notifications when you become eligible to donate again." },
  { icon: RiFilePdf2Line, title: "Donation Certificates", desc: "Download your official PDF donation certificate to record and celebrate each contribution." },
  { icon: RiAlertLine, title: "Blood Demand Alerts", desc: "Instant notifications when your blood group is urgently needed at a facility near you." },
];

// ── Component ─────────────────────────────────────────────────────────────────
function Process() {
  return (
    <div className="bg-white dark:bg-slate-900">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "60vh" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-700/30 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-red-300 backdrop-blur-sm">
              The Process
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white lg:text-6xl">
              From Registration to <span className="text-red-400">Donation</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              A simple, transparent process designed to make your donation experience seamless, safe, and impactful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── DONATION STEPS ───────────────────────────────────────────────── */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Step by Step</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">The Donation Process</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
              Here is exactly what happens from the moment you arrive at a donation camp.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-lg dark:border-slate-700"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={step.img} alt={step.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-700 text-sm font-black text-white shadow">
                      {step.num}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                      <Icon size={20} className="text-red-700 dark:text-red-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY DONATE ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 dark:bg-slate-800">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Impact</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Why Your Donation Matters</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { big: "1 Pint", sub: "Saves up to 3 Lives", note: "A single whole blood donation can be separated into components that help multiple patients." },
              { big: "Every 2s", sub: "Someone Needs Blood", note: "Blood is a perishable resource. Consistent donations are needed to maintain safe supply levels." },
              { big: "O−", sub: "Universal Donor Type", note: "O-negative blood is compatible with all blood types and is critical for emergency transfusions." },
            ].map(({ big, sub, note }, i) => (
              <motion.div
                key={big}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-4xl font-black text-red-700 dark:text-red-400">{big}</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{sub}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Features</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Services We Provide</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
              RedHope is more than a registration form. Here is everything the platform does for you.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-slate-200 p-6 transition hover:border-red-600 dark:border-slate-700 dark:hover:border-red-500"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 transition group-hover:bg-red-700 dark:bg-red-900/40 dark:group-hover:bg-red-700">
                  <Icon size={22} className="text-red-700 transition group-hover:text-white dark:text-red-400 dark:group-hover:text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold text-white">Ready to Make a Difference?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-red-100">
              Register on RedHope today and take your first step toward saving lives across Uganda.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-10 py-4 text-base font-bold text-red-700 shadow-xl transition hover:bg-red-50"
            >
              Start Donating Today <RiArrowRightLine size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Process;
