import { useEffect, useState } from "react";
import { AlertTriangle, Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";

const NotificationPopup = () => {
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showNotification = async () => {
      try {
        // Show only once per browser session
        const alreadyShown = sessionStorage.getItem(
          "medistock_notification_shown"
        );

        if (alreadyShown) {
          return;
        }

        const data = await notificationService.getNotifications({
          status: "OPEN",
        });

        const alerts = Array.isArray(data) ? data : [];

        if (alerts.length === 0) {
          return;
        }

        // Show the latest open alert
        const latestAlert = [...alerts].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )[0];

        setNotification(latestAlert);
        setIsVisible(true);

        sessionStorage.setItem(
          "medistock_notification_shown",
          "true"
        );

        // Automatically hide after 10 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 10000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error(
          "Failed to load notification popup:",
          error
        );
      }
    };

    showNotification();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleViewAlert = async () => {
    if (!notification) return;

    try {
      if (notification.status === "OPEN") {
        await notificationService.acknowledge(notification.id);
      }
    } catch (error) {
      console.error(
        "Failed to acknowledge notification:",
        error
      );
    }

    setIsVisible(false);
    navigate("/alerts");
  };

  if (!isVisible || !notification) {
    return null;
  }

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          container: "border-red-200 bg-red-50",
          icon: "bg-red-100 text-red-600",
          label: "text-red-700",
        };

      case "WARNING":
        return {
          container: "border-amber-200 bg-amber-50",
          icon: "bg-amber-100 text-amber-600",
          label: "text-amber-700",
        };

      case "INFO":
        return {
          container: "border-blue-200 bg-blue-50",
          icon: "bg-blue-100 text-blue-600",
          label: "text-blue-700",
        };

      default:
        return {
          container: "border-stone-200 bg-white",
          icon: "bg-stone-100 text-stone-600",
          label: "text-stone-700",
        };
    }
  };

  const styles = getSeverityStyles(notification.severity);

  return (
    <div className="fixed right-5 top-20 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <div
        className={`rounded-xl border p-4 shadow-lg backdrop-blur ${styles.container}`}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${styles.icon}`}
          >
            {notification.severity === "CRITICAL" ||
            notification.severity === "WARNING" ? (
              <AlertTriangle size={20} />
            ) : (
              <Bell size={20} />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${styles.label}`}
                >
                  {notification.severity || "ALERT"}
                </p>

                <h4 className="mt-0.5 text-sm font-semibold text-stone-800">
                  {notification.title || "New Alert"}
                </h4>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 rounded-md p-1 text-stone-400 transition hover:bg-white/70 hover:text-stone-600"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-stone-600">
              {notification.message}
            </p>

            {notification.medicineName && (
              <p className="mt-2 text-[11px] font-medium text-stone-500">
                Medicine: {notification.medicineName}
              </p>
            )}

            {/* Action */}
            <button
              type="button"
              onClick={handleViewAlert}
              className="mt-3 text-xs font-semibold text-[#456c60] hover:underline"
            >
              View alert →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;