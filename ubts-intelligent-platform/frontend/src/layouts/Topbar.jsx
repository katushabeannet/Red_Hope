import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  RiBellLine,
  RiCheckboxCircleLine,
  RiMenuLine,
  RiMoonLine,
  RiSunLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LogoutBtn from "../components/common/LogoutBtn";
import {
  generateMyNotifications,
  getAdminNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

const ADMIN_PAGES = {
  "/admin-dashboard":        { eyebrow: "Overview",                      title: "Dashboard" },
  "/admin-donors":            { eyebrow: "Donor Operations",              title: "Donor Management" },
  "/personalized-campaign":   { eyebrow: "Personalized Campaign Engine",  title: "Campaign Targeting" },
  "/admin-camps":             { eyebrow: "Donation Camp Operations",      title: "Manage Camps" },
  "/campaign-history":        { eyebrow: "Campaign Analytics",            title: "Campaign History" },
  "/admin-sms":               { eyebrow: "SMS Management",                title: "SMS Integration" },
  "/admin-whatsapp":          { eyebrow: "Messaging",                     title: "WhatsApp Management" },
  "/admin-blood-demand":      { eyebrow: "Notifications",                 title: "Blood Demand Management" },
  "/notifications":           { eyebrow: "Retention Alerts",              title: "Notifications" },
};

const DONOR_PAGES = {
  "/donor-dashboard":     { eyebrow: "Overview",         title: "Dashboard" },
  "/my-profile":          { eyebrow: "Donor Portal",     title: "My Profile" },
  "/blood-demand-alerts": { eyebrow: "Alerts",           title: "Blood Demand Alerts" },
  "/notifications":       { eyebrow: "Retention Alerts", title: "Notifications" },
};

function Topbar({ setSidebarOpen }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();

  const pageMap = user?.role === "ADMIN" ? ADMIN_PAGES : DONOR_PAGES;
  const page = pageMap[pathname] || {
    eyebrow: user?.role === "ADMIN" ? "Admin Intelligence" : "Donor Portal",
    title:   user?.role === "ADMIN" ? "Admin Workspace"    : "Donor Workspace",
  };

  // ── Notification bell ──
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (user) loadNotifs();
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadNotifs = async () => {
    try {
      setNotifLoading(true);
      let data;
      if (user?.role === "ADMIN") {
        data = await getAdminNotifications();
        setNotifs((data.notifications || []).slice(0, 5));
        setUnread(data.unread_notifications || 0);
      } else {
        await generateMyNotifications();
        data = await getMyNotifications();
        setNotifs((data.notifications || []).slice(0, 5));
        setUnread(data.unread_count || 0);
      }
    } catch { /* silent */ } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  // ── User avatar ──
  const displayName = user?.full_name || user?.username || user?.email || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const firstName = displayName.split(" ")[0];

  return (
    <header className="topbar">
      <button
        className="tb-icon-btn tb-mobile-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <RiMenuLine size={20} />
      </button>

      <div className="topbar-left">
        <div className="tb-eyebrow">{page.eyebrow}</div>
        <div className="tb-title rh-display">{page.title}</div>
      </div>

      <div className="topbar-actions">
        {/* Dark mode toggle */}
        <button className="tb-icon-btn" onClick={toggle} aria-label="Toggle dark mode">
          {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
        </button>

        {/* Notification bell */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            className="tb-icon-btn tb-bell-btn"
            onClick={() => { setBellOpen((v) => !v); }}
            aria-label="Notifications"
          >
            <RiBellLine size={18} />
            {unread > 0 && (
              <span className="tb-bell-badge">{unread > 9 ? "9+" : unread}</span>
            )}
          </button>

          {bellOpen && (
            <div className="tb-notif-drop">
              <div className="tb-notif-header">
                <span className="tb-notif-title">Notifications</span>
                {unread > 0 && (
                  <button className="tb-notif-all-btn" onClick={handleMarkAll}>
                    Mark all read
                  </button>
                )}
              </div>

              {notifLoading ? (
                <div className="tb-notif-loading">Loading…</div>
              ) : notifs.length === 0 ? (
                <div className="tb-notif-empty">No notifications yet</div>
              ) : (
                <div className="tb-notif-list">
                  {notifs.map((n) => (
                    <div key={n.id} className={`tb-notif-item${n.is_read ? " read" : ""}`}>
                      <div className="tb-notif-dot" />
                      <div className="tb-notif-body">
                        <p className="tb-notif-name">{n.title}</p>
                        <p className="tb-notif-msg">{n.message}</p>
                        <p className="tb-notif-time">
                          {new Date(n.created_at).toLocaleString("en-GB", {
                            day: "2-digit", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button
                          className="tb-notif-read-btn"
                          onClick={() => handleMarkOne(n.id)}
                          title="Mark as read"
                        >
                          <RiCheckboxCircleLine size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="tb-notif-footer">
                <a href="/notifications" style={{ fontSize: 12, color: "var(--cr)", fontWeight: 600 }}>
                  View all notifications →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User avatar card */}
        <div className="tb-user-card">
          <div className="tb-user-avatar">{initials}</div>
          <span className="tb-user-name">{firstName}</span>
        </div>

        {/* Signature logout button */}
        <LogoutBtn />
      </div>
    </header>
  );
}

export default Topbar;
