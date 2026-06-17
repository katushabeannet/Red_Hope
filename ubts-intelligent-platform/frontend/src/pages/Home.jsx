import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiBrainLine,
  RiCalendarLine,
  RiDropLine,
  RiGroupLine,
  RiHeartPulseLine,
  RiLoaderLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from "react-icons/ri";

import { getPublicStats } from "../services/adminService";
import { findNearestCampFromChatbot } from "../services/chatbotService";

function Home() {
  const [stats, setStats] = useState({ total_donors: null, active_camps: null });
  const [guestCamp, setGuestCamp] = useState(null);
  const [campLoading, setCampLoading] = useState(false);
  const [campError, setCampError] = useState("");

  useEffect(() => {
    getPublicStats()
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const handleFindCamp = () => {
    if (!navigator.geolocation) {
      setCampError("Geolocation is not supported by this browser.");
      return;
    }

    setCampLoading(true);
    setCampError("");
    setGuestCamp(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await findNearestCampFromChatbot({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGuestCamp(data);
        } catch {
          setCampError("No active donation camps found nearby. Try again later.");
        } finally {
          setCampLoading(false);
        }
      },
      () => {
        setCampError("Location access was denied. Please allow location to find nearby camps.");
        setCampLoading(false);
      }
    );
  };

  const activeCamps = stats.active_camps ?? "—";
  const totalDonors = stats.total_donors ?? "—";

  return (
    <div className="bg-white dark:bg-slate-900">
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-red-100/40 blur-3xl dark:bg-red-950/20" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-red-100/30 blur-3xl dark:bg-red-950/20" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 dark:border-emerald-800 dark:bg-emerald-950">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  AI-Powered Blood Mobilization
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50 lg:text-6xl">
                Save Lives Across Uganda.{" "}
                <span className="text-red-700 dark:text-red-500">
                  Your Next Donation Matters.
                </span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Experience intelligent blood donation management powered by AI.
                Check eligibility in seconds, discover nearby camps, and make a
                real impact on saving lives.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("camps")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 font-semibold text-white shadow-lg transition-colors hover:bg-red-800"
                >
                  Find Nearest Camp
                  <RiArrowRightLine size={18} />
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("about")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800"
                >
                  Learn Eligibility
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Active Camps Today
                  </h3>
                  <RiMapPinLine size={18} className="text-red-700" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {activeCamps}
                </p>
                <p className="mt-2 text-xs text-slate-500">Across Uganda</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    URGENT DEMANDS
                  </h3>
                  <RiDropLine size={16} className="text-red-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  O+
                </p>
                <p className="mt-2 text-xs text-slate-500">Most Needed</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    UNITS NEEDED
                  </h3>
                  <RiHeartPulseLine size={16} className="text-red-700" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  500+
                </p>
                <p className="mt-2 text-xs text-slate-500">Daily</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              [RiGroupLine, totalDonors, "Registered Donors"],
              [RiCalendarLine, activeCamps, "Active Camps"],
              [RiDropLine, "500+", "Units Needed Daily"],
              [RiShieldCheckLine, "12,000+", "Lives Saved"],
            ].map(([Icon, value, label]) => (
              <div key={label} className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
                    <Icon size={20} className="text-red-700 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 lg:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 lg:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-white px-6 py-16 dark:bg-slate-900 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 lg:text-4xl">
              Check Your Eligibility
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              Review the major blood donation requirements before visiting a
              donation camp.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              ["Age", "17 years and above"],
              ["Weight", "At least 50 kg"],
              ["Hemoglobin", "Healthy blood level"],
              ["Health Status", "No recent illness"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
                  <RiShieldCheckLine className="text-red-700 dark:text-red-400" size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="camps" className="bg-slate-50 px-6 py-16 dark:bg-slate-800 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 lg:text-4xl">
                Find Donation Camps Near You
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                No login required. Use your browser location to instantly find
                the nearest active blood donation camp.
              </p>

              <button
                onClick={handleFindCamp}
                disabled={campLoading}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
              >
                {campLoading ? (
                  <>
                    <RiLoaderLine className="animate-spin" size={18} />
                    Locating...
                  </>
                ) : (
                  <>
                    <RiMapPinLine size={18} />
                    Find Nearest Camp
                  </>
                )}
              </button>

              {campError && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {campError}
                </p>
              )}

              {guestCamp && guestCamp.nearest_camp && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Nearest Active Camp
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">
                    {guestCamp.nearest_camp.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {guestCamp.nearest_camp.venue} &middot; {guestCamp.nearest_camp.district}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400">
                    {guestCamp.distance_km} km away
                  </p>
                  {guestCamp.nearest_camp.contact_phone && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Contact: {guestCamp.nearest_camp.contact_phone}
                    </p>
                  )}
                </div>
              )}

              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                Want personalized eligibility checks and donation history?{" "}
                <Link to="/login" className="font-semibold text-red-700 hover:underline dark:text-red-400">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link to="/register" className="font-semibold text-red-700 hover:underline dark:text-red-400">
                  register as a donor
                </Link>
                .
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <RiMapPinLine className="mb-4 text-red-700" size={36} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Location-Based Recommendation
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                The system uses browser geolocation and Haversine distance
                calculation to find the nearest active camp and log the query
                in the knowledge graph for traceability.
              </p>
              <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Available to all visitors — no account needed
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Powered by Haversine geospatial distance
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Shows only currently active camps
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 dark:bg-slate-900 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 lg:text-4xl">
              Why Choose UBTS Platform?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              Our AI-powered platform simplifies donation support with
              intelligent screening and real-time insights.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              [RiHeartPulseLine, "Instant Eligibility Screening", "Get assessment results based on your health profile."],
              [RiMapPinLine, "Real-Time Camp Locator", "Find active donation camps near you — no login required."],
              [RiBrainLine, "Smart Availability Prediction", "Personalized availability insights for donors."],
            ].map(([Icon, title, desc]) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:border-red-700 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 transition-colors group-hover:bg-red-700 dark:bg-red-950">
                  <Icon
                    size={24}
                    className="text-red-700 transition-colors group-hover:text-white dark:text-red-400"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="border-t border-slate-200 bg-gradient-to-r from-red-700 to-red-600 px-6 py-16 dark:border-slate-700 dark:from-red-600 dark:to-red-500 lg:px-12"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-white lg:text-4xl">
            Ready to Save Lives?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join donors across Uganda. Your contribution matters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-red-700 shadow-lg transition-colors hover:bg-slate-50"
            >
              Get Started <RiArrowRightLine size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-8 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
            >
              Already a Member? Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
