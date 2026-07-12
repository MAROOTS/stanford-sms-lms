import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers3,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  ChevronsLeft, FileDown, TrendingUp, BarChart3, ClipboardList, Calendar, Landmark,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navSections = [
  { label: 'Overview', items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    label: 'Academics',
    items: [
      { to: '/students', icon: Users, label: 'Students' },
      { to: '/terms', icon: Calendar, label: 'Terms' },
      { to: '/exams', icon: ClipboardList, label: 'Exams' },
      { to: '/marks-entry', icon: BarChart3, label: 'Marks Entry' },
      { to: '/results', icon: TrendingUp, label: 'Results & Ranking' },
      { to: '/report-cards', icon: FileDown, label: 'Report Cards' },
      { to: '/teachers', icon: GraduationCap, label: 'Teachers' },
      { to: '/classes', icon: Layers3, label: 'Classes' },
      { to: '/subjects', icon: BookOpen, label: 'Subjects' },
      { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    ],
  },
  { label: 'Operations', items: [{ to: '/fees', icon: CreditCard, label: 'Fee Collection' }] },
];

export default function Sidebar() {
  const { user } = useAuth();

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col h-screen sticky top-0" aria-label="Main navigation">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-teal-accent flex items-center justify-center">
          <Landmark size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg">StanfordOS</span>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
        <div className="w-7 h-7 rounded-md bg-teal-accent flex items-center justify-center text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="text-sm font-medium truncate">{displayName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <h3 className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 mb-2 uppercase">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {section.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-teal-accent/20 text-teal-accent"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <button className="flex items-center gap-2 px-5 py-4 text-sm text-slate-400 hover:text-white border-t border-white/5 transition-colors" aria-label="Collapse sidebar">
        <ChevronsLeft size={16} aria-hidden="true" />
        Collapse
      </button>
    </aside>
  );
}
