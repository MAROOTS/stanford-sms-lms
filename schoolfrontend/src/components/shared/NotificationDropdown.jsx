import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, BookOpen, ClipboardCheck, CreditCard, Calendar, CheckCheck, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const TYPE_CONFIG = {
  STUDENT_REGISTERED: { icon: UserPlus, color: 'text-blue-500 bg-blue-50' },
  EXAM_RESULT: { icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
  ATTENDANCE_TAKEN: { icon: ClipboardCheck, color: 'text-teal-500 bg-teal-50' },
  FEE_PAYMENT: { icon: CreditCard, color: 'text-emerald-500 bg-emerald-50' },
  TERM_REMINDER: { icon: Calendar, color: 'text-amber-500 bg-amber-50' },
  GENERAL: { icon: Bell, color: 'text-slate-500 bg-slate-100' },
};

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(isoString).toLocaleDateString();
}

const POLL_INTERVAL_MS = 45_000;

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/notifications');
      setNotifications(data);
    } catch {
      // fail silently — notifications shouldn't block the rest of the UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) load(); // refresh on open, in case a poll cycle hasn't hit yet
  };

  const handleClick = async (notification) => {
    setOpen(false);
    if (!notification.read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
      axiosClient.patch(`/notifications/${notification.id}/read`).catch(() => {});
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axiosClient.post('/notifications/mark-all-read');
    } catch {
      load(); // resync on failure
    }
  };

  return (
      <div className="relative" ref={ref}>
        <button
            onClick={handleOpen}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-surface-100 transition-colors"
            aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
          )}
        </button>

        {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-surface-200 shadow-elevated animate-fade-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                {unreadCount > 0 ? (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                ) : (
                    <span className="text-[11px] text-slate-400 font-medium">All caught up</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-50">
                {loading && (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <Loader2 size={18} className="animate-spin" />
                    </div>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <Bell size={22} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No notifications yet</p>
                    </div>
                )}

                {!loading && notifications.map((n) => {
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.GENERAL;
                  const Icon = config.icon;
                  return (
                      <div
                          key={n.id}
                          onClick={() => handleClick(n)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer ${
                              !n.read ? 'bg-teal-accent/5' : ''
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-teal-accent mt-1.5 shrink-0" />}
                      </div>
                  );
                })}
              </div>
            </div>
        )}
      </div>
  );
}