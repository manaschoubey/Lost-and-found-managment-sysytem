import { useState, useEffect, useRef } from 'react';
import { getUnreadNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await getUnreadCount();
      setCount(res.data.data);
    } catch (err) { /* silent */ }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getUnreadNotifications();
      setNotifications(res.data.data || []);
    } catch (err) { /* silent */ }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications([]);
    setCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-700/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No new notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors"
                  onClick={() => handleMarkRead(n.id)}
                >
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
