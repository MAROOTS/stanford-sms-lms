import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useSidebar } from '../../context/useSidebar';
import { useSchoolProfile } from '../../context/useSchoolProfile';

import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileDown,
  GraduationCap,
  Inbox,
  Layers3,
  LayoutDashboard,
  Library,
  Megaphone,
  Send,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';

const adminTeacherNav = [
  {
    label: 'OVERVIEW',
    items: [
      {
        to: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
      },
    ],
  },
  {
    label: 'ACADEMICS',
    items: [
      {
        to: '/admissions',
        icon: UserCheck,
        label: 'Admissions',
        roles: ['ADMIN'],
      },
      {
        to: '/students',
        icon: Users,
        label: 'Students',
      },
      {
        to: '/terms',
        icon: Calendar,
        label: 'Terms',
      },
      { to: '/my-timetable', icon: Calendar, label: 'My timetable', roles: ['TEACHER'] },
      {
        to: '/exams',
        icon: ClipboardList,
        label: 'Exams',
      },
      {
        to: '/marks-entry',
        icon: BarChart3,
        label: 'Marks Entry',
      },
      {
        to: '/results',
        icon: TrendingUp,
        label: 'Results & Ranking',
      },
      {
        to: '/report-cards',
        icon: FileDown,
        label: 'Report Cards',
      },
      {
        to: '/teachers',
        icon: GraduationCap,
        label: 'Teachers',
      },
      {
        to: '/classes',
        icon: Layers3,
        label: 'Classes',
      },
      {
        to: '/teaching-assignments',
        icon: BookOpen,
        label: 'Teaching assignments',
        roles: ['ADMIN'],
      },
      { to: '/timetable', icon: Calendar, label: 'Timetable', roles: ['ADMIN'] },
      {
        to: '/subjects',
        icon: BookOpen,
        label: 'Subjects',
      },
      {
        to: '/attendance',
        icon: ClipboardCheck,
        label: 'Attendance',
      },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      {
        to: '/fees',
        icon: CreditCard,
        label: 'Fee Collection',
      },
      {
        to: '/parents',
        icon: Users,
        label: 'Parents',
        roles: ['ADMIN'],
      },
      {
        to: '/library',
        icon: Library,
        label: 'Library',
        roles: ['ADMIN'],
      },
      {
        to: '/announcements',
        icon: Megaphone,
        label: 'Announcements',
        roles: ['ADMIN', 'TEACHER'],
      },
      {
        to: '/staff',
        icon: UserCog,
        label: 'Staff',
        roles: ['ADMIN'],
      },
      { to: '/leads', icon: Inbox, label: 'Leads', roles: ['ADMIN'] },
    ],
  },
];

const studentNav = [
  {
    label: 'OVERVIEW',
    items: [
      {
        to: '/dashboard',
        icon: LayoutDashboard,
        label: 'My Dashboard',
      },
    ],
  },
  {
    label: 'ACADEMICS',
    items: [
      {
        to: '/my-attendance',
        icon: ClipboardCheck,
        label: 'My Attendance',
      },
      { to: '/my-timetable', icon: Calendar, label: 'My timetable' },
      {
        to: '/my-results',
        icon: TrendingUp,
        label: 'My Results',
      },
      {
        to: '/my-report-cards',
        icon: FileDown,
        label: 'Report Cards',
      },
    ],
  },
  {
    label: 'OTHER',
    items: [
      {
        to: '/my-fees',
        icon: CreditCard,
        label: 'My Fees',
      },
      {
        to: '/my-library',
        icon: Library,
        label: 'Library',
      },
      {
        to: '/announcements',
        icon: Megaphone,
        label: 'Announcements',
      },
    ],
  },
];

const parentNav = [
  {
    label: 'OVERVIEW',
    items: [
      {
        to: '/parent-dashboard',
        icon: LayoutDashboard,
        label: 'My Dashboard',
      },
    ],
  },
  {
    label: 'MY CHILDREN',
    items: [
      {
        to: '/parent-dashboard',
        icon: Users,
        label: 'Children Overview',
      },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      {
        to: '/announcements',
        icon: Megaphone,
        label: 'Announcements',
      },
    ],
  },
];

const librarianNav = [
  {
    label: 'LIBRARY',
    items: [
      {
        to: '/library',
        icon: Library,
        label: 'Catalog',
      },
      {
        to: '/library/loans',
        icon: Send,
        label: 'Loans',
      },
    ],
  },
  {
    label: 'OTHER',
    items: [
      {
        to: '/announcements',
        icon: Megaphone,
        label: 'Announcements',
      },
    ],
  },
];

const accountantNav = [
  {
    label: 'FINANCE',
    items: [
      {
        to: '/fees',
        icon: CreditCard,
        label: 'Fee Collection',
      },
    ],
  },
  {
    label: 'OTHER',
    items: [
      {
        to: '/announcements',
        icon: Megaphone,
        label: 'Announcements',
      },
    ],
  },
];

const platformAdminNav = [
  { label: 'PLATFORM', items: [{ to: '/platform/schools', icon: Building2, label: 'Schools' }] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { profile } = useSchoolProfile();
  const schoolName = profile?.name || 'StanfordOS';
  const logoSrc = profile?.logoUrl || '/logo.png';

  const navSections =
      user?.role === 'PLATFORM_ADMIN'
          ? platformAdminNav
          : user?.role === 'STUDENT'
              ? studentNav
              : user?.role === 'PARENT'
                  ? parentNav
                  : user?.role === 'LIBRARIAN'
                      ? librarianNav
                      : user?.role === 'ACCOUNTANT'
                          ? accountantNav
                          : adminTeacherNav;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

  const getInitialOpenSections = () => {
    const openSections = {};

    navSections.forEach((section) => {
      openSections[section.label] = section.items.some(
          (item) =>
              (!item.roles || item.roles.includes(user?.role)) &&
              location.pathname === item.to
      );
    });

    if (!Object.values(openSections).some(Boolean) && navSections.length > 0) {
      openSections[navSections[0].label] = true;
    }

    return openSections;
  };

  const [openSections, setOpenSections] = useState(getInitialOpenSections);

  const toggleSection = (sectionLabel) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionLabel]: !prev[sectionLabel],
    }));
  };

  return (
      <aside
          className={`bg-navy-900 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-white/5 select-none ${
              collapsed ? 'w-18' : 'w-64'
          }`}
      >
        {/* LOGO AREA */}
        <div
            className={`flex items-center gap-3 px-5 py-5 overflow-hidden whitespace-nowrap border-b border-white/5 ${
                collapsed ? 'justify-center px-0' : ''
            }`}
        >
          <img
              src={logoSrc}
              alt={`${schoolName} logo`}
              className="w-8 h-8 rounded-xl object-cover shrink-0 ring-2 ring-white/10 shadow-xs"
          />
          {!collapsed && (
              <span className="font-bold text-base tracking-tight truncate text-slate-100">
            {schoolName}
          </span>
          )}
        </div>

        {/* USER BADGE */}
        <div
            className={`mx-3 my-4 flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? 'mx-2 justify-center px-0 bg-transparent border-none' : ''
            }`}
        >
          <div className="w-8 h-8 rounded-lg bg-teal-accent text-navy-900 flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {initials}
          </div>

          {!collapsed && (
              <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-slate-100 truncate">
              {user?.username || user?.email}
            </span>
                <span className="text-[10px] font-medium text-slate-400 capitalize truncate">
              {user?.role?.toLowerCase().replace('_', ' ') || 'User'}
            </span>
              </div>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
                (item) => !item.roles || item.roles.includes(user?.role)
            );

            if (visibleItems.length === 0) return null;

            const isOpen = openSections[section.label];

            return (
                <div key={section.label} className="space-y-1">
                  {!collapsed ? (
                      <>
                        {/* SECTION HEADER */}
                        <button
                            type="button"
                            onClick={() => toggleSection(section.label)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 hover:text-slate-200 transition-colors uppercase cursor-pointer"
                        >
                          <span>{section.label}</span>
                          <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 text-slate-400 ${
                                  isOpen ? 'rotate-0' : '-rotate-90'
                              }`}
                          />
                        </button>

                        {/* SECTION CONTENTS */}
                        <div
                            className={`grid transition-all duration-200 ${
                                isOpen
                                    ? 'grid-rows-[1fr] opacity-100'
                                    : 'grid-rows-[0fr] opacity-0'
                            }`}
                        >
                          <div className="overflow-hidden">
                            <div className="space-y-1 pt-1 pb-1">
                              {visibleItems.map(({ to, icon: Icon, label }) => (
                                  <NavLink
                                      key={to}
                                      to={to}
                                      className={({ isActive }) =>
                                          `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all overflow-hidden whitespace-nowrap ${
                                              isActive
                                                  ? 'bg-teal-accent/15 text-teal-accent font-semibold border border-teal-accent/20'
                                                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                          }`
                                      }
                                  >
                                    <Icon size={16} className="shrink-0" />
                                    <span className="truncate">{label}</span>
                                  </NavLink>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                  ) : (
                      /* COLLAPSED SIDEBAR ITEMS */
                      <div className="space-y-1">
                        {visibleItems.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                title={label}
                                className={({ isActive }) =>
                                    `flex items-center justify-center p-2.5 rounded-xl text-xs font-medium transition-all overflow-hidden ${
                                        isActive
                                            ? 'bg-teal-accent/15 text-teal-accent border border-teal-accent/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                              <Icon size={18} className="shrink-0" />
                            </NavLink>
                        ))}
                      </div>
                  )}
                </div>
            );
          })}
        </nav>

        {/* COLLAPSE TOGGLE */}
        <button
            type="button"
            onClick={toggle}
            className={`flex items-center gap-3 px-5 py-4 text-xs font-semibold text-slate-400 hover:text-white border-t border-white/5 transition-all duration-200 hover:bg-white/5 cursor-pointer ${
                collapsed ? 'justify-center px-0' : ''
            }`}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </aside>
  );
}