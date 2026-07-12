import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, GraduationCap, Layers3, BookOpen, ClipboardList, CornerDownLeft, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const CATEGORIES = [
  { key: 'students', label: 'Students', icon: Users, endpoint: '/students', searchField: 'firstName', color: 'text-blue-600 bg-blue-50' },
  { key: 'teachers', label: 'Teachers', icon: GraduationCap, endpoint: '/teachers', searchField: 'firstName', color: 'text-teal-600 bg-teal-50' },
  { key: 'classSections', label: 'Classes', icon: Layers3, endpoint: '/class-sections', searchField: 'name', color: 'text-amber-600 bg-amber-50' },
  { key: 'subjects', label: 'Subjects', icon: BookOpen, endpoint: '/subjects', searchField: 'name', color: 'text-purple-600 bg-purple-50' },
  { key: 'exams', label: 'Exams', icon: ClipboardList, endpoint: '/exams', searchField: 'name', color: 'text-rose-600 bg-rose-50' },
];

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent-200 text-accent-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const flatResults = Object.values(results).flat();

  // Search backend
  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults({});
      return;
    }
    setLoading(true);
    try {
      const searches = CATEGORIES.map(async (cat) => {
        try {
          const { data } = await axiosClient.get(cat.endpoint);
          const items = Array.isArray(data) ? data : [];
          return {
            key: cat.key,
            items: items.filter((item) => {
              const searchStr = [
                item[cat.searchField],
                item.lastName,
                item.email,
                item.name,
                item.code,
                item.examType,
                item.termName,
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
              return searchStr.includes(q.toLowerCase());
            }).slice(0, 5),
          };
        } catch {
          return { key: cat.key, items: [] };
        }
      });
      const all = await Promise.all(searches);
      const map = {};
      all.forEach(({ key, items }) => {
        if (items.length > 0) map[key] = items;
      });
      setResults(map);
    } catch {
      setResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    setSelectedIdx(0);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIdx]) {
        handleSelect(flatResults[selectedIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (item) => {
    setQuery('');
    setOpen(false);
    setResults({});

    // Navigate based on what the item is
    if (item.firstName && item.lastName !== undefined) {
      // It's a student or teacher
      if (item.rollNumber !== undefined || item.admissionNumber !== undefined) {
        navigate('/students');
      } else {
        navigate('/teachers');
      }
    } else if (item.gradeLevelId || item.gradeLevelName) {
      navigate('/classes');
    } else if (item.code !== undefined) {
      navigate('/subjects');
    } else if (item.examType) {
      navigate('/exams');
    } else if (item.termName !== undefined) {
      navigate('/terms');
    }
  };

  const getItemLabel = (item, catKey) => {
    switch (catKey) {
      case 'students':
      case 'teachers':
        return `${item.firstName || ''} ${item.lastName || ''}`.trim();
      default:
        return item.name || '';
    }
  };

  const getItemSub = (item, catKey) => {
    switch (catKey) {
      case 'students':
      case 'teachers':
        return item.email || '';
      case 'exams':
        return `${item.examType || ''} — ${item.termName || ''}`;
      case 'classSections':
        return item.gradeLevelName || item.gradeLevelStage || '';
      case 'subjects':
        return item.code || '';
      default:
        return '';
    }
  };

  const shouldShowDropdown = open && query.length >= 2;

  return (
    <div className="relative hidden sm:block flex-1 max-w-md" ref={containerRef}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search students, teachers, classes..."
        value={query}
        onChange={handleChange}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
        onKeyDown={handleKeyDown}
        aria-label="Search"
        aria-expanded={shouldShowDropdown}
        role="combobox"
        className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300 transition-all hover:bg-surface-50"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-white border border-surface-200 rounded-md px-1.5 py-0.5 shadow-sm pointer-events-none select-none z-10">
        ⌘K
      </kbd>

      {/* Dropdown results */}
      {shouldShowDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-surface-200 shadow-elevated animate-fade-in z-50 max-h-[420px] overflow-y-auto" role="listbox">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Searching...
            </div>
          )}

          {!loading && flatResults.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">
              No results found for "<span className="font-medium text-slate-600">{query}</span>"
            </p>
          )}

          {!loading && Object.entries(results).map(([catKey, items]) => {
            const cat = CATEGORIES.find((c) => c.key === catKey);
            if (!cat || items.length === 0) return null;
            const Icon = cat.icon;

            return (
              <div key={catKey}>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-50 border-b border-surface-100">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${cat.color}`}>
                    <Icon size={11} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{cat.label}</span>
                  <span className="text-[11px] text-slate-400">{items.length}</span>
                </div>
                {items.map((item, idx) => {
                  const globalIdx = flatResults.indexOf(item);
                  const label = getItemLabel(item, catKey);
                  const sub = getItemSub(item, catKey);

                  return (
                    <button
                      key={`${catKey}-${item.id || idx}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        globalIdx === selectedIdx
                          ? 'bg-accent-50'
                          : 'hover:bg-surface-50'
                      }`}
                      role="option"
                      aria-selected={globalIdx === selectedIdx}
                    >
                      <div className="text-left min-w-0">
                        <p className="font-medium text-slate-700 truncate">{highlightMatch(label, query)}</p>
                        {sub && <p className="text-xs text-slate-400 truncate mt-0.5">{highlightMatch(sub, query)}</p>}
                      </div>
                      {globalIdx === selectedIdx && (
                        <CornerDownLeft size={14} className="text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
