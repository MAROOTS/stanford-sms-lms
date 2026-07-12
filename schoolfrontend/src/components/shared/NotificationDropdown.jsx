import { useState, useRef, useEffect } from 'react';
import { Bell, UserPlus, BookOpen, ClipboardCheck, CreditCard, Calendar } from 'lucide-react';

// Simulated notifications — in production these come from the backend
const MOCK_NOTIFICATIONS = [
  { id: 1, icon: UserPlus, text: 'New student registered', time: '2 min ago', color: 'text-blue-500 bg-blue-50' },
  { id: 2, icon: BookOpen, text: 'English exam results posted', time: '1 hour ago', color: 'text-purple-500 bg-purple-50' },
  { id: 3, icon: ClipboardCheck, text: 'Attendance taken for Grade 7', time: '3 hours ago', color: 'text-teal-500 bg-teal-50' },
  { id: 4, icon: CreditCard, text: 'Fee payment received: $250', time: 'Yesterday', color: 'text-emerald-500 bg-emerald-50' },
  { id: 5, icon: Calendar, text: 'Term 2 ends in 2 weeks', time: 'Yesterday', color: 'text-amber-500 bg-amber-50' },
];

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);

  const unreadCount = notifications.length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
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
            <span className="text-[11px] text-slate-400 font-medium">{unreadCount} new</span>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-surface-50">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
