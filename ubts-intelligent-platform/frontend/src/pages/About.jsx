import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiAwardLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiUserSmileLine,
} from "react-icons/ri";

// ── Data ─────────────────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "Alberto Nuwarinda Grande",
    role: "Lead Developer & AI Engineer",
    bio: "Specializes in machine learning and intelligent systems design.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
  },
  {
    name: "Team Member 2",
    role: "Backend Developer",
    bio: "Expert in Django REST APIs and scalable database architecture.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
  },
  {
    name: "Team Member 3",
    role: "Frontend Developer",
    bio: "Passionate about crafting beautiful, accessible user interfaces.",
    photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&q=80",
  },
  {
    name: "Team Member 4",
    role: "Systems Analyst",
    bio: "Ensures our systems meet real-world blood donation requirements.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
  },
];

const DONORS = [
  { name: "Sarah Nakato", group: "O+", donations: 12, district: "Kampala", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80" },
  { name: "James Otim", group: "A+", donations: 8, district: "Gulu", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80" },
  { name: "Grace Akinyi", group: "B+", donations: 15, district: "Wakiso", photo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&q=80" },
  { name: "Robert Ssempa", group: "O-", donations: 6, district: "Jinja", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80" },
  { name: "Mary Namukasa", group: "AB+", donations: 20, district: "Entebbe", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80" },
  { name: "David Okello", group: "A-", donations: 9, district: "Mbale", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80" },
];

const ACHIEVEMENTS = [
  { icon: RiUserSmileLine, value: "12,000+", label: "Success Smiles" },
  { icon: RiGroupLine, value: "5,000+", label: "Happy Donors" },
  { icon: RiAwardLine, value: "8", label: "Total Awards" },
  { icon: RiHeartPulseLine, value: "15,000+", label: "Happy Recipients" },
];

// ── Component ─────────────────────────────────────────────────────────────────
function About() {
  const [donorIdx, setDonorIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDonorIdx((i) => (i + 1) % DONORS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const visibleDonors = [0, 1, 2].map((offset) => DONORS[(donorIdx + offset) % DONORS.length]);

  return (
    <div className="bg-white dark:bg-slate-900">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "60vh" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-700/30 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-red-300 backdrop-blur-sm">
              About Us
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white lg:text-6xl">
              Saving Lives, <span className="text-red-400">One Drop at a Time</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Discover the people, mission, and technology behind RedHope — Uganda's intelligent blood donation platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO WE ARE ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Our Story</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">Who We Are</h2>
              <div className="mt-6 space-y-4 border-l-4 border-red-600 pl-5">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  RedHope is an AI-powered intelligent blood donation management system developed by a team of Makerere University final-year students as part of their capstone project.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our mission is to bridge the gap between blood donors and recipients across Uganda using machine learning, geospatial technology, and real-time data to make blood donation seamless and impactful.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  We believe every person deserves timely access to safe blood. RedHope makes this possible through smart donor matching, eligibility screening, and personalized donation reminders.
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-2xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"
                alt="RedHope Team"
                className="h-[400px] w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OUR TEAM ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Meet the Builders</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white lg:text-4xl">The Minds Behind RedHope</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
              A passionate team of Makerere University students dedicated to solving Uganda's blood shortage crisis.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white p-6 text-center shadow-md dark:bg-slate-900"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-red-100 dark:ring-red-900"
                />
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{member.role}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DONOR RECOGNITION ────────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1920&q=80" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-red-900/70" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-300">Our Heroes</p>
              <h2 className="mt-1 text-3xl font-extrabold text-white">Recognized Donors</h2>
              <p className="mt-2 text-slate-200">Celebrating those who give the gift of life</p>
            </div>
          </div>
        </div>
        <div className="bg-white pb-16 pt-36 dark:bg-slate-900" />
        <div className="absolute inset-x-0" style={{ top: "9rem" }}>
          <div className="mx-auto max-w-6xl px-6 lg:px-12">
            {/* Desktop: all 6 */}
            <div className="hidden gap-5 lg:grid lg:grid-cols-6">
              {DONORS.map((d, i) => (
                <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-slate-800">
                  <img src={d.photo} alt={d.name} className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-red-100" />
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{d.name}</p>
                  <span className="mt-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{d.group}</span>
                  <p className="mt-1 text-xs text-slate-500">{d.donations} donations</p>
                  <p className="text-xs text-slate-400">{d.district}</p>
                </motion.div>
              ))}
            </div>
            {/* Mobile: 3 cycling cards */}
            <div className="flex justify-center gap-4 lg:hidden">
              {visibleDonors.map((d) => (
                <div key={d.name} className="rounded-2xl bg-white p-4 text-center shadow-xl dark:bg-slate-800" style={{ minWidth: 110 }}>
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

      {/* ── ACHIEVEMENTS ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Impact</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Our Achievements</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400 italic">
              Since launching in 2024, RedHope has transformed blood donation management across Uganda.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {ACHIEVEMENTS.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 p-6 text-center dark:border-slate-700"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                  <Icon size={22} className="text-red-700 dark:text-red-400" />
                </div>
                <p className="text-3xl font-extrabold text-red-700 dark:text-red-400">{value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US ───────────────────────────────────────────────────────── */}
      <section>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=900&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="flex items-center bg-slate-100 px-8 py-20 dark:bg-slate-800">
            <div className="max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Get Started</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Join Us and Save a Life</h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                Become part of a growing community of Ugandans saving lives through blood donation. Register on RedHope today and make your first contribution.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-700 px-8 py-3.5 font-bold text-white shadow-lg transition hover:bg-red-800"
              >
                Register Now <RiArrowRightLine size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
