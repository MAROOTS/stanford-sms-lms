import { Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';
  const role = user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase()) : '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 gap-4 sticky top-0 z-10">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          placeholder="Search students, teachers, classes..."
          aria-label="Search"
          className="w-full pl-9 pr-14 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 pointer-events-none select-none">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} aria-hidden="true" />
        </button>

        <button onClick={logout} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors" aria-label={`Logged in as ${displayName}. Click to sign out.`}>
          <div className="w-8 h-8 rounded-full bg-teal-accent/15 flex items-center justify-center text-xs font-semibold text-teal-700">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
