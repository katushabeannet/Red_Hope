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

function MainLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    showToast({
      type: "info",
      title: "Logged Out",
      message: "You have successfully signed out.",
    });

    navigate("/login");
  };

  const guestNavClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-red-700 dark:text-red-400"
      : "font-medium text-slate-600 transition-colors hover:text-red-700 dark:text-slate-300 dark:hover:text-red-400";

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
    // Silent fail so layout does not break
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
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
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
    showToast({
      type: "error",
      title: "Notification Error",
      message: "Unable to open notification.",
    });
  }
};

const handleMarkAllRead = async () => {
  try {
    await markAllNotificationsAsRead();
    await loadNotifications();
  } catch {
    showToast({
      type: "error",
      title: "Notification Error",
      message: "Unable to mark notifications as read.",
    });
  }
};

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        {/* ── Guest Header ── */}
        <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-lg dark:border-slate-700/50 dark:bg-slate-900/90">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="flex h-16 items-center justify-between gap-6">
              {/* Part 1: Logo + Name + Tagline */}
              <NavLink to="/" className="flex shrink-0 items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700 text-white shadow">
                  <RiDropLine size={22} />
                </span>
                <div className="hidden sm:block">
                  <p className="text-base font-extrabold leading-none text-slate-900 dark:text-white">RedHope</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">One drop. One Life. One Hope.</p>
                </div>
              </NavLink>

              {/* Part 2: Nav links */}
              <nav className="hidden items-center gap-7 lg:flex">
                {[
                  { to: "/", label: "Home" },
                  { to: "/about", label: "About" },
                  { to: "/process", label: "Process" },
                  { to: "/campaigns", label: "Campaigns" },
                  { to: "/contact", label: "Contact" },
                ].map(({ to, label }) => (
                  <NavLink key={to} to={to} end={to === "/"} className={guestNavClass}>{label}</NavLink>
                ))}
              </nav>

              {/* Part 3: Actions + Theme toggle */}
              <div className="flex items-center gap-2.5">
                <button onClick={toggle}
                  className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Toggle theme">
                  {dark ? <RiSunLine size={17} /> : <RiMoonLine size={17} />}
                </button>
                <NavLink to="/login"
                  className="hidden rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-700 dark:border-slate-600 dark:text-slate-300 dark:hover:text-red-400 sm:inline-flex">
                  Log In
                </NavLink>
                <NavLink to="/register"
                  className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-800">
                  Sign Up
                </NavLink>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>

        <Footer />
        <FloatingChatbot />
      </div>
    );
  }

  const navItems =
    user.role === "ADMIN"
      ? [
          {
            to: "/admin-dashboard",
            label: "Dashboard",
            icon: RiDashboardLine,
          },
          {
            to: "/admin-donors",
            label: "Donor Management",
            icon: RiGroupLine,
          },
          {
            to: "/personalized-campaign",
            label: "Campaign Targeting",
            icon: RiMegaphoneLine,
          },
          {
            to: "/admin-camps",
            label: "Manage Camps",
            icon: RiMapPinLine,
          },
          {
            to: "/campaign-history",
            label: "Campaign History",
            icon: RiBarChart2Line,
          },
          {
            to: "/admin-sms",
            label: "SMS Management",
            icon: RiMessage2Line,
          },
          {
            to: "/admin-whatsapp",
            label: "WhatsApp",
            icon: RiWhatsappLine,
          },
          {
            to: "/admin-blood-demand",
            label: "Blood Demand",
            icon: RiAlertLine,
          },
          {
            to: "/notifications",
            label: "Notifications",
            icon: RiNotification3Line,
          },
        ]
      : [
          {
            to: "/donor-dashboard",
            label: "Dashboard",
            icon: RiDashboardLine,
          },
          {
            to: "/my-profile",
            label: "My Profile",
            icon: RiUserLine,
          },
          {
            to: "/blood-demand-alerts",
            label: "Blood Alerts",
            icon: RiHeartPulseLine,
          },
          {
            to: "/notifications",
            label: "Notifications",
            icon: RiNotification3Line,
          },
        ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-[260px] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-700 text-white">
            <RiDropLine size={18} />
          </span>

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              UBTS
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intelligence Platform
            </p>
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
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {initials}
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user.role}
              </p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intelligent blood donation support system
            </p>
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
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {unreadCount} unread
                    </p>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400"
                    >
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
                          !notification.is_read
                            ? "bg-red-50/60 dark:bg-red-950/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                              notification.is_read ? "bg-slate-300" : "bg-red-700"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {notification.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                              {notification.message}
                            </p>

                            {notification.action_label && (
                              <p className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400">
                                {notification.action_label}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        No notifications
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Retention alerts will appear here.
                      </p>
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

function Footer() {
  const navLinkCls = "text-slate-400 text-sm hover:text-white transition-colors";

  return (
    <footer style={{ backgroundColor: "#2c3e50" }} className="dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <NavLink to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700 text-white">
                <RiDropLine size={20} />
              </span>
              <span className="text-lg font-extrabold text-white">RedHope</span>
            </NavLink>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Uganda's AI-powered intelligent blood donation management system. Connecting donors, camps, and recipients to save lives every day.
            </p>
            <div className="mt-5 space-y-1.5">
              <NavLink to="/" className={navLinkCls}>Home</NavLink><br />
              <NavLink to="/about" className={navLinkCls}>About</NavLink><br />
              <NavLink to="/process" className={navLinkCls}>The Process</NavLink><br />
              <NavLink to="/campaigns" className={navLinkCls}>Campaigns</NavLink>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/register", label: "Register as Donor" },
                { to: "/login", label: "Donor Login" },
                { to: "/campaigns", label: "Find a Camp" },
                { to: "/contact", label: "Contact Us" },
                { to: "/process", label: "How It Works" },
              ].map(({ to, label }) => (
                <li key={to}><NavLink to={to} className={navLinkCls}>{label}</NavLink></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Resources</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Blood Facts", href: "https://www.who.int/news-room/fact-sheets/detail/blood-safety-and-availability" },
                { label: "Donation Guide", href: "https://www.ubts.go.ug" },
                { label: "Eligibility Criteria", href: "https://www.ubts.go.ug" },
                { label: "UBTS Official Site", href: "https://www.ubts.go.ug" },
                { label: "MOH Uganda", href: "https://www.health.go.ug" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={navLinkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Partners */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Partners</h4>
            <ul className="space-y-2.5">
              {[
                { label: "UBTS Uganda", href: "https://www.ubts.go.ug" },
                { label: "Ministry of Health", href: "https://www.health.go.ug" },
                { label: "WHO Uganda", href: "https://www.afro.who.int/countries/uganda" },
                { label: "Uganda Red Cross", href: "https://www.redcrossuganda.org" },
                { label: "Makerere University", href: "https://www.mak.ac.ug" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={navLinkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-slate-500 sm:flex-row lg:px-12">
          <p>© 2026 RedHope — UBTS Intelligent Donor Assistance Platform. All rights reserved.</p>
          <p>Built with ❤️ by Makerere University Computer Science students</p>
        </div>
      </div>
    </footer>
  );
}

export default MainLayout;