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

} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

const navSections = [
  { label: 'Overview', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
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
];

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar();

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
              {section.items.map(({ to, icon: Icon, label }) => (
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
