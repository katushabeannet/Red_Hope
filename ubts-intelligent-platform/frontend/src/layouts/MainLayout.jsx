import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiDropLine,
  RiGroupLine,
  RiLogoutBoxLine,
  RiMapPinLine,
  RiMoonLine,
  RiSunLine,
  RiUserLine,
  RiMegaphoneLine,
  RiBarChart2Line,
  RiMessage2Line,
  RiWhatsappLine,
  RiAlertLine,
  RiHeartPulseLine,
  RiFacebookFill,
  RiInstagramLine,
  RiLinkedinFill,
  RiYoutubeLine,
  RiTwitterXLine,
} from "react-icons/ri";

import { useEffect, useRef, useState } from "react";
import { RiNotification3Line } from "react-icons/ri";
import {
  generateMyNotifications,
  getAdminNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import FloatingChatbot from "../components/chatbot/FloatingChatbot";
import BackToTop from "../components/common/BackToTop";

// ─── Blood Drop SVG ────────────────────────────────────────────────────────────
function DropSVG({ gradId = "dropG1", size = 28 }) {
  const h = Math.round(size * 1.25);
  return (
    <svg width={size} height={h} viewBox="0 0 36 44" fill="none">
      <path
        d="M18 2C18 2 2 19 2 28C2 37.4 9.2 42 18 42C26.8 42 34 37.4 34 28C34 19 18 2 18 2Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M12 28.5C12 33 14.6 36 18 36"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id={gradId} x1="18" y1="2" x2="18" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8314F" />
          <stop offset="1" stopColor="#8B1A1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Guest nav links ───────────────────────────────────────────────────────────
const GUEST_NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Us" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/process", label: "Process" },
  { to: "/contact", label: "Contact" },
];

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const SOCIAL = [
    { Icon: RiFacebookFill, href: "#" },
    { Icon: RiTwitterXLine, href: "#" },
    { Icon: RiInstagramLine, href: "#" },
    { Icon: RiLinkedinFill, href: "#" },
    { Icon: RiYoutubeLine, href: "#" },
  ];

  return (
    <footer className="rh-footer" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 28px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 44 }}>

          {/* Col 1 – Brand */}
          <div>
            <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <DropSVG gradId="dropFtrA" size={28} />
              <span className="rh-display" style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                RedHope
              </span>
            </NavLink>
            <p style={{ marginTop: 16, fontSize: 13, lineHeight: 1.75, color: "var(--footer-text)" }}>
              Uganda's AI-powered intelligent blood donation management system. Connecting donors, camps,
              and recipients to save lives every day.
            </p>
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { to: "/", l: "Home" },
                { to: "/about", l: "About" },
                { to: "/process", l: "Process" },
                { to: "/campaigns", l: "Campaigns" },
              ].map(({ to, l }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--footer-text)",
                    background: "rgba(255,255,255,.08)",
                    padding: "4px 12px",
                    borderRadius: 50,
                    textDecoration: "none",
                  }}
                >
                  {l}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Col 2 – Navigation */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", marginBottom: 20 }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none" }}>
              {[
                { to: "/register", label: "Register as Donor" },
                { to: "/login", label: "Donor Login" },
                { to: "/campaigns", label: "Find a Camp" },
                { to: "/contact", label: "Contact Us" },
                { to: "/process", label: "How It Works" },
              ].map(({ to, label }) => (
                <li key={to} style={{ marginBottom: 12 }}>
                  <NavLink to={to} className="rh-footer-link">{label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Resources */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", marginBottom: 20 }}>
              Resources
            </h4>
            <ul style={{ listStyle: "none" }}>
              {[
                { label: "Blood Facts", href: "https://www.who.int/news-room/fact-sheets/detail/blood-safety-and-availability" },
                { label: "Donation Guide", href: "https://www.ubts.go.ug" },
                { label: "Eligibility Criteria", href: "https://www.ubts.go.ug" },
                { label: "UBTS Official Site", href: "https://www.ubts.go.ug" },
                { label: "MOH Uganda", href: "https://www.health.go.ug" },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: 12 }}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="rh-footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Partners */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", marginBottom: 20 }}>
              Partners
            </h4>
            <ul style={{ listStyle: "none" }}>
              {[
                { label: "UBTS Uganda", href: "https://www.ubts.go.ug" },
                { label: "Ministry of Health", href: "https://www.health.go.ug" },
                { label: "WHO Uganda", href: "https://www.afro.who.int/countries/uganda" },
                { label: "Uganda Red Cross", href: "https://www.redcrossuganda.org" },
                { label: "Makerere University", href: "https://www.mak.ac.ug" },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: 12 }}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="rh-footer-link">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <p style={{ fontSize: 12, color: "#718096" }}>
            © 2026 RedHope — UBTS Intelligent Donor Assistance Platform. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {SOCIAL.map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--footer-text)", textDecoration: "none", transition: "background .2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cr)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Layout ───────────────────────────────────────────────────────────────
function MainLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast({ type: "info", title: "Logged Out", message: "You have successfully signed out." });
    navigate("/");
  };

  const sideNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    }`;

  const displayName = user?.full_name || user?.username || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const loadNotifications = async () => {
    try {
      if (user?.role === "ADMIN") {
        const data = await getAdminNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_notifications || 0);
      } else {
        await generateMyNotifications();
        const data = await getMyNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        await loadNotifications();
      }
      if (notification.action_url) {
        navigate(notification.action_url);
        setShowNotifications(false);
      }
    } catch {
      showToast({ type: "error", title: "Notification Error", message: "Unable to open notification." });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch {
      showToast({ type: "error", title: "Notification Error", message: "Unable to mark notifications as read." });
    }
  };

  // ── Guest layout ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Header */}
        <header className="rh-header">
          <div className="rh-header-inner">
            {/* Brand */}
            <NavLink
              to="/"
              style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}
            >
              <div className="animate-rh-float" style={{ lineHeight: 0 }}>
                <DropSVG gradId="dropHdr" size={28} />
              </div>
              <div>
                <p className="rh-brand-name">RedHope</p>
                <p className="rh-brand-tagline">One Drop. One Life. One Hope.</p>
              </div>
            </NavLink>

            {/* Desktop nav */}
            <nav className="rh-nav">
              {GUEST_NAV.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `rh-nav-link${isActive ? " active" : ""}`}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="rh-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={toggle}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--rh-border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-s)", transition: "all .2s" }}
                aria-label="Toggle dark mode"
              >
                {dark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
              </button>
              <NavLink to="/login" className="rh-btn-login">Log In</NavLink>
              <NavLink to="/register" className="rh-btn-signup">Sign Up</NavLink>
            </div>

            {/* Hamburger */}
            <button
              className="rh-hamburger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span style={mobileOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
              <span style={mobileOpen ? { opacity: 0 } : {}} />
              <span style={mobileOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
            </button>
          </div>
        </header>

        {/* Mobile nav overlay */}
        <div className={`rh-mobile-nav${mobileOpen ? " open" : ""}`}>
          {GUEST_NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "rh-display"
                  : "rh-display"
              }
              style={({ isActive }) => ({
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 800,
                textDecoration: "none",
                color: isActive ? "var(--cr)" : "var(--ink)",
              })}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <NavLink to="/login" className="rh-btn-login" onClick={() => setMobileOpen(false)}>
              Log In
            </NavLink>
            <NavLink to="/register" className="rh-btn-signup" onClick={() => setMobileOpen(false)}>
              Sign Up
            </NavLink>
          </div>
        </div>

        <main>
          <Outlet />
        </main>

        <Footer />
        <FloatingChatbot />
        <BackToTop />
      </div>
    );
  }

  // ── Authenticated layout ──────────────────────────────────────────────────────
  const navItems =
    user.role === "ADMIN"
      ? [
          { to: "/admin-dashboard", label: "Dashboard", icon: RiDashboardLine },
          { to: "/admin-donors", label: "Donor Management", icon: RiGroupLine },
          { to: "/personalized-campaign", label: "Campaign Targeting", icon: RiMegaphoneLine },
          { to: "/admin-camps", label: "Manage Camps", icon: RiMapPinLine },
          { to: "/campaign-history", label: "Campaign History", icon: RiBarChart2Line },
          { to: "/admin-sms", label: "SMS Management", icon: RiMessage2Line },
          { to: "/admin-whatsapp", label: "WhatsApp", icon: RiWhatsappLine },
          { to: "/admin-blood-demand", label: "Blood Demand", icon: RiAlertLine },
          { to: "/notifications", label: "Notifications", icon: RiNotification3Line },
        ]
      : [
          { to: "/donor-dashboard", label: "Dashboard", icon: RiDashboardLine },
          { to: "/my-profile", label: "My Profile", icon: RiUserLine },
          { to: "/blood-demand-alerts", label: "Blood Alerts", icon: RiHeartPulseLine },
          { to: "/notifications", label: "Notifications", icon: RiNotification3Line },
        ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-[260px] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-700 text-white">
            <RiDropLine size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">UBTS</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intelligence Platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={sideNavClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-3 py-4 dark:border-slate-800">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <RiLogoutBoxLine size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-6">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
              {user.role === "ADMIN" ? "Admin Workspace" : "Donor Workspace"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intelligent blood donation support system</p>
          </div>

          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative rounded-xl bg-slate-100 p-2.5 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Notifications"
            >
              <RiNotification3Line size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-[9999] mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                          !notification.is_read ? "bg-red-50/60 dark:bg-red-950/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.is_read ? "bg-slate-300" : "bg-red-700"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">{notification.message}</p>
                            {notification.action_label && (
                              <p className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400">{notification.action_label}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">No notifications</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Retention alerts will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300 sm:inline-flex">
              {user.role}
            </span>
            <button
              onClick={toggle}
              className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 lg:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      <FloatingChatbot />
    </div>
  );
}

export default MainLayout;
