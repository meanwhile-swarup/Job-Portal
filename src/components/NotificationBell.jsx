import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

// Status color helpers
const statusColors = {
  Accepted:    { dot: "bg-emerald-500", badge: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50 dark:border-emerald-800/60" },
  Rejected:    { dot: "bg-red-500",     badge: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200/50 dark:border-red-800/60" },
  Shortlisted: { dot: "bg-violet-500",  badge: "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 border-violet-200/50 dark:border-violet-800/60" },
  Interviewed: { dot: "bg-sky-500",     badge: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/50 dark:border-sky-800/60" },
  Hired:       { dot: "bg-emerald-600", badge: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50 dark:border-emerald-800/60" },
  new_application: { dot: "bg-blue-500", badge: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/50 dark:border-blue-800/60" },
};

const typeIcons = {
  status_update: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  new_application: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNotificationClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className={`relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          open
            ? "bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm shadow-red-500/40 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/60 z-50 overflow-hidden animate-fade-in-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const colorKey = n.type === "new_application" ? "new_application" : (n.metadata?.status || n.type);
                const colors = statusColors[colorKey] || { dot: "bg-slate-400", badge: "" };
                const icon = typeIcons[n.type] || typeIcons["status_update"];

                return (
                  <button
                    key={n.id}
                    id={`notification-item-${n.id}`}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150 cursor-pointer relative ${
                      !n.is_read ? "bg-violet-50/40 dark:bg-violet-950/20" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className={`absolute top-4 right-3 w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                    )}

                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                      n.type === "new_application"
                        ? "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400"
                        : "bg-violet-50 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900/50 text-violet-600 dark:text-violet-400"
                    }`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug pr-3 ${
                        !n.is_read
                          ? "text-slate-800 dark:text-white font-semibold"
                          : "text-slate-600 dark:text-slate-300 font-medium"
                      }`}>
                        {n.message}
                      </p>
                      {n.metadata?.status && (
                        <span className={`inline-flex mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                          {n.metadata.status}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                        {formatTime(n.created_at)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
