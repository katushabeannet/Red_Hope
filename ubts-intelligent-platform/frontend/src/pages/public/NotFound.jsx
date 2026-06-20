import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiDropLine, RiHome4Line, RiMapPinLine, RiMailLine, RiHeartPulseLine } from "react-icons/ri";

const QUICK_LINKS = [
  { to: "/",          icon: RiHome4Line,      label: "Home",       desc: "Back to the main page" },
  { to: "/campaigns", icon: RiMapPinLine,     label: "Campaigns",  desc: "Find a nearby blood drive" },
  { to: "/register",  icon: RiHeartPulseLine, label: "Donate",     desc: "Register as a blood donor" },
  { to: "/contact",   icon: RiMailLine,       label: "Contact",    desc: "Get in touch with us" },
];

function NotFound() {
  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: "var(--rh-canvas)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      textAlign: "center",
    }}>
      {/* Animated blood drop with 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 180 }}
        style={{ position: "relative", width: 220, height: 260, margin: "0 auto 48px" }}
      >
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <div key={i}
            className="animate-rh-pulse"
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: "2px solid rgba(196,30,58,.22)",
              inset: -(i + 1) * 18,
              animationDelay: `${i * 0.4}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Blood drop + 404 text */}
        <div className="animate-rh-float" style={{ width: "100%", height: "100%", position: "relative" }}>
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none" style={{ display: "block" }}>
            <path
              d="M110 12C110 12 18 108 18 162C18 214 58 252 110 252C162 252 202 214 202 162C202 108 110 12 110 12Z"
              fill="url(#nfDropGrad)"
            />
            <path
              d="M68 168C68 190 82 212 110 212"
              stroke="rgba(255,255,255,.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="nfDropGrad" x1="110" y1="12" x2="110" y2="252" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E8314F" />
                <stop offset="1" stopColor="#8B1A1A" />
              </linearGradient>
            </defs>
          </svg>

          {/* 404 text overlaid on the drop */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64 }}>
            <p className="rh-display" style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>404</p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ maxWidth: 520, marginBottom: 52 }}
      >
        <h1 className="rh-display" style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "var(--ink)", marginBottom: 14 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-s)", lineHeight: 1.75 }}>
          The page you're looking for doesn't exist or has been moved. You may have followed an outdated link or typed the URL incorrectly.
        </p>
      </motion.div>

      {/* Quick-link cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, width: "100%", maxWidth: 780 }}
      >
        {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            style={{
              borderRadius: 18,
              background: "#fff",
              border: "1.5px solid var(--rh-border)",
              padding: "24px 20px",
              textDecoration: "none",
              transition: "all .25s",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,.05)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--cr)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,30,58,.12)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--rh-border)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--cr-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon size={22} style={{ color: "var(--cr)" }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: "var(--ink-l)" }}>{desc}</p>
          </Link>
        ))}
      </motion.div>

      {/* Footer note */}
      <p style={{ marginTop: 48, fontSize: 12, color: "var(--ink-l)" }}>
        Think this is a mistake? Email{" "}
        <a href="mailto:info@ubts.go.ug" style={{ color: "var(--cr)", fontWeight: 600, textDecoration: "none" }}>
          info@ubts.go.ug
        </a>
      </p>
    </div>
  );
}

export default NotFound;
