import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiMailOpenLine,
  RiNotification3Line,
  RiRefreshLine,
} from "react-icons/ri";

import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import AdminLoader from "../components/common/AdminLoader";

import {
  generateMyNotifications,
  getAdminNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function Notifications() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let data;
      if (user?.role === "ADMIN") {
        data = await getAdminNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_notifications || 0);
      } else {
        await generateMyNotifications();
        data = await getMyNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      showToast({ type: "error", title: "Notifications Failed", message: "Unable to load notifications." });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOneRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
      showToast({ type: "success", title: "Notification Updated", message: "Notification marked as read." });
    } catch {
      showToast({ type: "error", title: "Update Failed", message: "Unable to mark notification as read." });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      showToast({ type: "success", title: "Notifications Updated", message: "All notifications have been marked as read." });
    } catch {
      showToast({ type: "error", title: "Update Failed", message: "Unable to mark all notifications as read." });
    }
  };

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="page-eyebrow">Retention Alerts</div>
          <h1 className="page-title rh-display">Notifications</h1>
          <p className="page-desc">View donor retention reminders, badge alerts, campaign updates, and system notifications.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={loadNotifications} disabled={loading}>
            <RiRefreshLine /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <RiMailOpenLine /> Mark All Read
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon cr"><RiNotification3Line size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{notifications.length}</div>
            <div className="stat-label">Total Notifications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon am"><RiMailOpenLine size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gr"><RiCheckboxCircleLine size={18} /></div>
          <div className="stat-body">
            <div className="stat-val">{notifications.length - unreadCount}</div>
            <div className="stat-label">Read</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title-row">
            <div className="panel-icon cr"><RiNotification3Line size={16} /></div>
            <div>
              <div className="panel-title">Notification History</div>
              <div className="panel-sub">New retention notifications are generated automatically when the page loads.</div>
            </div>
          </div>
        </div>
        <div className="panel-body">
          {loading ? (
            <AdminLoader text="Loading notifications…" />
          ) : notifications.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    borderRadius: 14,
                    border: notification.is_read ? "1px solid var(--border)" : "1px solid #bbf7d0",
                    background: notification.is_read ? "var(--canvas)" : "#f0fdf4",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 16, flex: 1 }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: notification.is_read ? "var(--border)" : "#dcfce7",
                          color: notification.is_read ? "var(--ink-l)" : "#15803d",
                        }}
                      >
                        <RiNotification3Line size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <h4 style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{notification.title}</h4>
                          <span className={`badge ${notification.is_read ? "badge-gray" : "badge-red"}`}>
                            {notification.notification_type}
                          </span>
                          {!notification.is_read && (
                            <span style={{ borderRadius: 999, background: "#15803d", padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "#fff" }}>New</span>
                          )}
                        </div>

                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-s)", margin: "0 0 8px" }}>
                          {notification.message}
                        </p>

                        <p style={{ fontSize: 12, color: "var(--ink-l)", margin: 0 }}>
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {!notification.is_read && (
                        <button className="btn btn-outline btn-sm" onClick={() => handleMarkOneRead(notification.id)}>
                          Mark Read
                        </button>
                      )}
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "var(--cr)", padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none" }}
                        >
                          {notification.action_label || "Open"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <RiNotification3Line size={32} />
              <p>No notifications yet</p>
              <span style={{ fontSize: 13, color: "var(--ink-s)" }}>Retention reminders, badge alerts, and campaign notifications will appear here.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;
