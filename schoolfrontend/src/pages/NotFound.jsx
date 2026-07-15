import { Link } from 'react-router-dom';
import { Home, ArrowLeft} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-6">
      <div className="text-center max-w-md">
        <div className="text-[100px] font-black text-surface-200 leading-none select-none mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Check the URL or go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Home size={16} />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-white hover:bg-surface-50 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-xl border border-surface-200 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
