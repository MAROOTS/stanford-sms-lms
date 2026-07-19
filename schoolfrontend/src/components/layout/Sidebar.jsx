import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers3,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  ChevronsLeft,
  FileDown,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Calendar,
  Sparkles,
  Library,
  Megaphone,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";

const adminTeacherNav = [
  { label: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    label: 'Academics',
    items: [
      { to: '/students', icon: Users, label: 'Students' },
      { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
      { to: '/classes', icon: Layers3, label: 'Classes' },
      { to: '/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/terms', icon: Calendar, label: 'Terms' },
      { to: '/exams', icon: ClipboardList, label: 'Exams' },
      { to: '/marks-entry', icon: BarChart3, label: 'Marks Entry' },
      { to: '/results', icon: TrendingUp, label: 'Results & Ranking' },
      { to: '/report-cards', icon: FileDown, label: 'Report Cards' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/fees', icon: CreditCard, label: 'Fee Collection' },
      { to: '/library', icon: Library, label: 'Library' },
    ],
  },
  {
    label: 'LMS',
    items: [
      { to: '/courses', icon: BookOpen, label: 'Courses' },
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/uploads', icon: Upload, label: 'Uploads' },
    ],
  },
];

const studentNav = [
  { label: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' }] },
  {
    label: 'Academics',
    items: [
      { to: '/my-attendance', icon: ClipboardCheck, label: 'My Attendance' },
      { to: '/my-results', icon: TrendingUp, label: 'My Results' },
      { to: '/my-report-cards', icon: FileDown, label: 'Report Cards' },
    ],
  },
  {
    label: 'Other',
    items: [
      { to: '/my-fees', icon: CreditCard, label: 'My Fees' },
      { to: '/my-library', icon: Library, label: 'Library' },
    ],
  },
  {
    label: 'LMS',
    items: [
      { to: '/courses', icon: BookOpen, label: 'Courses' },
      { to: '/announcements', icon: Megaphone, label: 'Announcements' },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { collapsed, toggle } = useSidebar();

  const navSections = user?.role === 'STUDENT' ? studentNav : adminTeacherNav;
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-64'
      } bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-out z-20 border-r border-white/5`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 h-16 border-b border-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/25 shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-base tracking-tight whitespace-nowrap">StanfordOS</span>
            <p className="text-[10px] text-slate-400 leading-tight">School Manager</p>
          </div>
        )}
      </div>

      {/* User profile */}
      <div className={`${collapsed ? 'mx-3' : 'mx-3'} my-3`}>
        <div className="flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl px-3 py-2.5 transition-colors backdrop-blur-sm border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-accent-500/20 shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold leading-tight truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 leading-tight truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6 py-2">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <h3 className="px-3 mb-1.5 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
                {section.label}
              </h3>
            ) : (
              <div className="px-2 mb-2">
                <div className="border-t border-white/5" />
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items
                .filter((item) => !item.roles || item.roles.includes(user?.role))
                .map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-accent-500/15 text-accent-400 shadow-sm shadow-accent-500/5'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        } ${collapsed ? 'justify-center' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full" />
                          )}
                          <Icon size={18} aria-hidden="true" className="shrink-0" />
                          {!collapsed && <span>{label}</span>}
                          {isActive && collapsed && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-l-full" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <ChevronsLeft
            size={18}
            aria-hidden="true"
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
