import { useEffect, useState } from "react";
import {
  RiCheckboxCircleLine,
  RiMailOpenLine,
  RiNotification3Line,
  RiRefreshLine,
} from "react-icons/ri";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";

import {
  generateMyNotifications,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

function Notifications() {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await generateMyNotifications();

      const data = await getMyNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      showToast({
        type: "error",
        title: "Notifications Failed",
        message: "Unable to load notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOneRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();

      showToast({
        type: "success",
        title: "Notification Updated",
        message: "Notification marked as read.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Unable to mark notification as read.",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();

      showToast({
        type: "success",
        title: "Notifications Updated",
        message: "All notifications have been marked as read.",
      });
    } catch {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Unable to mark all notifications as read.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-[var(--crimson)]">
            Retention Alerts
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
            View donor retention reminders, badge alerts, campaign updates, and
            system notifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={loadNotifications} loading={loading}>
            <RiRefreshLine />
            Refresh
          </Button>

          <Button onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <RiMailOpenLine />
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          icon={RiNotification3Line}
          label="Total Notifications"
          value={notifications.length}
        />

        <SummaryCard
          icon={RiMailOpenLine}
          label="Unread"
          value={unreadCount}
        />

        <SummaryCard
          icon={RiCheckboxCircleLine}
          label="Read"
          value={notifications.length - unreadCount}
        />
      </div>

      <Card>
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Notification History
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            New retention notifications are generated automatically when the
            page loads.
          </p>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 transition ${
                  notification.is_read
                    ? "border-[var(--border)] bg-[var(--surface-2)]"
                    : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notification.is_read
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      }`}
                    >
                      <RiNotification3Line size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {notification.title}
                        </h4>

                        <Badge
                          label={notification.notification_type}
                          variant={
                            notification.is_read ? "neutral" : "ineligible"
                          }
                        />

                        {!notification.is_read && (
                          <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-semibold text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkOneRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}

                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="inline-flex items-center justify-center rounded-xl bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
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
          <div className="rounded-xl bg-[var(--surface-2)] p-8 text-center">
            <RiNotification3Line
              size={32}
              className="mx-auto text-[var(--text-muted)]"
            />
            <h4 className="mt-3 font-semibold text-[var(--text-primary)]">
              No notifications yet
            </h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Retention reminders, badge alerts, and campaign notifications will
              appear here.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--crimson-light)] text-[var(--crimson)]">
        <Icon size={22} />
      </div>

      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
        {value}
      </h3>
    </Card>
  );
}

export default Notifications;