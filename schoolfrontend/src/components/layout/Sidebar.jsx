import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers3,
  BookOpen,
  ClipboardCheck,
  FileText,
  CreditCard,
  ChevronsLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navSections = [
  {
    label: "OVERVIEW",
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "ACADEMICS",
    items: [
      { to: "/students", icon: Users, label: "Students" },
      { to: "/teachers", icon: GraduationCap, label: "Teachers" },
      { to: "/classes", icon: Layers3, label: "Classes" },
      { to: "/subjects", icon: BookOpen, label: "Subjects" },
      { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
      { to: "/examinations", icon: FileText, label: "Examinations" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [{ to: "/fees", icon: CreditCard, label: "Fee Collection" }],
  },
];

export default function Sidebar() {
  const { user } = useAuth();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-teal-accent flex items-center justify-center font-bold text-sm">
          🏛
        </div>
        <span className="font-bold text-lg">StanfordOS</span>
      </div>

      <div className="mx-4 mb-4 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
        <div className="w-7 h-7 rounded-md bg-teal-accent flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <span className="text-sm font-medium truncate">{user?.email}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 text-[11px] font-semibold tracking-wider text-slate-400 mb-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-accent/15 text-teal-accent"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button className="flex items-center gap-2 px-5 py-4 text-sm text-slate-400 hover:text-white border-t border-white/5">
        <ChevronsLeft size={16} />
        Collapse
      </button>
    </aside>
  );
}
