import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";

const NotificationBell = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);

      const data = await notificationService.getNotifications();

      const alerts = Array.isArray(data) ? data : [];

      const openAlerts = alerts.filter(
        (alert) => alert.status === "OPEN"
      );

      setNotifications(
        alerts
          .filter((alert) => alert.status !== "RESOLVED")
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
          .slice(0, 10)
      );

      setUnreadCount(openAlerts.length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.status === "OPEN") {
        await notificationService.acknowledge(notification.id);
      }
    } catch (error) {
      console.error("Failed to acknowledge notification:", error);
    }

    setIsOpen(false);

    navigate("/alerts");
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/alerts");
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";

      case "WARNING":
        return "bg-amber-100 text-amber-700";

      case "INFO":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-stone-100 text-stone-600";
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleBellClick}
        className="relative grid h-10 w-10 place-items-center rounded-full text-stone-500 transition hover:bg-[#edf4f1] hover:text-[#456c60]"
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-800">
                Notifications
              </h3>

              <p className="text-xs text-stone-400">
                {unreadCount > 0
                  ? `${unreadCount} unread alert${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "No unread alerts"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleViewAll}
              className="flex items-center gap-1 text-xs font-semibold text-[#456c60] hover:underline"
            >
              View all
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell
                  size={28}
                  className="mx-auto mb-2 text-stone-300"
                />

                <p className="text-sm font-medium text-stone-500">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-stone-400">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-stone-100 px-4 py-3 transition hover:bg-stone-50 ${
                    notification.status === "OPEN"
                      ? "bg-[#fafcfb]"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Severity */}
                    <span
                      className={`mt-0.5 h-fit rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${getSeverityClass(
                        notification.severity
                      )}`}
                    >
                      {notification.severity}
                    </span>

                    {/* Content */}
                    <button
                      type="button"
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-stone-800">
                          {notification.title || "Alert"}
                        </p>

                        {notification.status === "OPEN" && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                        {notification.message}
                      </p>

                      {notification.medicineName && (
                        <p className="mt-1 text-[11px] font-medium text-stone-400">
                          Medicine: {notification.medicineName}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-stone-400">
                        {notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                          : ""}
                      </p>
                    </button>

                    {/* Acknowledged indicator */}
                    {notification.status === "ACKNOWLEDGED" && (
                      <div
                        className="mt-1 text-[#456c60]"
                        title="Acknowledged"
                      >
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-stone-200 px-4 py-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full rounded-lg bg-[#edf4f1] px-3 py-2 text-xs font-semibold text-[#456c60] transition hover:bg-[#dfece7]"
              >
                View all alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;