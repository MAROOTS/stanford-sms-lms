import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import GlobalSearch from "../shared/GlobalSearch";
import NotificationDropdown from "../shared/NotificationDropdown";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';
  const roleLabel = user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase()) : '';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-surface-200 flex items-center justify-between px-6 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={toggle}
          className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-surface-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <GlobalSearch />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2" ref={menuRef}>
        <NotificationDropdown />
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-surface-100 transition-colors border border-transparent hover:border-surface-200"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label={`Logged in as ${displayName}. Click for account menu.`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-accent-500/20">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-200 shadow-elevated py-1.5 animate-fade-in z-50">
              <div className="px-3 py-2.5 border-b border-surface-100">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-surface-50 transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-slate-400" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <div className="border-t border-surface-100 mt-1 pt-1">
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
