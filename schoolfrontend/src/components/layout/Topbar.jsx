import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useSidebar } from "../../context/useSidebar";
import { useTheme } from '../../context/useTheme';
import GlobalSearch from "../shared/GlobalSearch";
import NotificationDropdown from "../shared/NotificationDropdown";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
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
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 gap-4 sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Hamburger Toggle */}
          <button
              type="button"
              onClick={toggle}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100/80 transition-all active:scale-95 lg:hidden"
              aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Global Search Component */}
          <GlobalSearch />
        </div>

        {/* Right Side Actions & Profile */}
        <div className="flex items-center gap-3" ref={menuRef}>
          <NotificationDropdown />

          <div className="relative">
            <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/80 focus:outline-none active:scale-[0.98]"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label={`Logged in as ${displayName}. Click for account menu.`}
            >
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-2xs">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">{roleLabel}</p>
              </div>
              <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                        type="button"
                        onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <Settings size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                      Account Settings
                    </button>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      {theme === 'dark' ? (
                          <Sun size={16} className="text-amber-500" />
                      ) : (
                          <Moon size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                      )}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                        type="button"
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors group cursor-pointer"
                    >
                      <LogOut size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors" />
                      Sign Out
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </header>
  );
}