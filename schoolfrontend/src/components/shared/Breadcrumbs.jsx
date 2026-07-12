import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  classes: 'Classes',
  subjects: 'Subjects',
  terms: 'Terms',
  exams: 'Examinations',
  'marks-entry': 'Marks Entry',
  results: 'Results & Ranking',
  'report-cards': 'Report Cards',
  attendance: 'Attendance',
  fees: 'Fee Collection',
  'fee-items': 'Fee Items',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Home size={14} />
          </Link>
        </li>
        {segments.map((seg, idx) => {
          const href = '/' + segments.slice(0, idx + 1).join('/');
          const label = ROUTE_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const isLast = idx === segments.length - 1;

          return (
            <li key={seg} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-slate-300" />
              {isLast ? (
                <span className="font-medium text-slate-700">{label}</span>
              ) : (
                <Link to={href} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
