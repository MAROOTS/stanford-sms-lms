import { Search, Plus, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 gap-4 sticky top-0 z-10">
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Search students, teachers, classes..."
          className="w-full pl-9 pr-14 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-accent"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 bg-teal-accent hover:bg-teal-600 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          Quick Add
        </button>

        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-accent text-white text-[10px] rounded-full flex items-center justify-center">
            5
          </span>
        </button>

        <button onClick={logout} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-300" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
