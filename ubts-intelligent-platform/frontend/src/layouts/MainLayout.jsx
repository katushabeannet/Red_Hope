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
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-700 text-white">
                <RiDropLine size={20} />
              </span>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  UBTS Platform
                </p>
                <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                  Intelligent Donor Assistance
                </p>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-8 lg:flex">
              <NavLink to="/" className={guestNavClass}>
                Home
              </NavLink>

              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-medium text-slate-600 transition-colors hover:text-red-700 dark:text-slate-300 dark:hover:text-red-400"
              >
                Eligibility
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("camps")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-medium text-slate-600 transition-colors hover:text-red-700 dark:text-slate-300 dark:hover:text-red-400"
              >
                Camps
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("faq")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-medium text-slate-600 transition-colors hover:text-red-700 dark:text-slate-300 dark:hover:text-red-400"
              >
                Get Started
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Toggle theme"
              >
                {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
              </button>

              <NavLink
                to="/register"
                className="hidden rounded-xl border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 dark:text-red-400 lg:inline-flex"
              >
                Register
              </NavLink>

              <NavLink
                to="/login"
                className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800"
              >
                Login
              </NavLink>
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
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-10 dark:border-slate-800 dark:bg-slate-950 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-700 text-white">
              <RiDropLine size={20} />
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              UBTS Platform
            </span>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            An intelligent donor assistance and campaign planning platform for
            blood donation support, eligibility screening, location
            recommendations, and transparent AI reasoning.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Eligibility Guidance</li>
            <li>Nearest Camps</li>
            <li>Donor Dashboard</li>
            <li>Admin Intelligence</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
            Technologies
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>MPNet Retrieval</li>
            <li>Neo4j Traceability</li>
            <li>Leaflet Maps</li>
            <li>Django REST API</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800">
        © 2026 UBTS Intelligent Donor Assistance Platform. Sample project
        environment.
      </div>
    </footer>
  );
}

export default MainLayout;