import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * Reusable DataTable with:
 * - Client-side search/filter (#3)
 * - Column sorting (#2)
 * - Pagination (#1)
 * - Responsive: table on desktop, cards on mobile (#4)
 */
export default function DataTable({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  renderMobileCard,
  actions, // { view, edit, delete } handlers
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim() || searchFields.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchFields]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * size, safePage * size);

  // Reset page on search
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortKey !== columnKey) return <ChevronDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-accent-500" /> : <ChevronDown size={12} className="text-accent-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden animate-pulse">
        <div className="px-6 py-4 border-b border-surface-100">
          <div className="h-9 bg-surface-200 rounded-lg w-64" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-surface-50 flex gap-4">
            {Array.from({ length: columns.length }).map((_, j) => (
              <div key={j} className="h-4 bg-surface-100 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      {/* Toolbar: search + page size */}
      {searchFields.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100 gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300 transition-all"
            />
          </div>
          {filtered.length !== data.length && (
            <span className="text-xs text-slate-500">{filtered.length} of {data.length} results</span>
          )}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 ${col.sortable ? 'cursor-pointer select-none group hover:text-slate-600 transition-colors' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </div>
                </th>
              ))}
              {actions && <th className="px-5 py-3 text-right w-10">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-16">
                  <EmptyState
                    icon={emptyIcon}
                    title={search ? 'No matches found' : emptyTitle}
                    description={search ? `No results for "${search}"` : emptyDescription}
                    action={!search ? emptyAction : undefined}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {actions.view && (
                          <button onClick={() => actions.view(item)} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        )}
                        {actions.edit && (
                          <button onClick={() => actions.edit(item)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                        )}
                        {actions.delete && (
                          <button onClick={() => actions.delete(item)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {renderMobileCard && (
        <div className="md:hidden divide-y divide-surface-100">
          {paginated.length === 0 ? (
            <div className="px-5 py-16">
              <EmptyState
                icon={emptyIcon}
                title={search ? 'No matches found' : emptyTitle}
                description={search ? `No results for "${search}"` : emptyDescription}
              />
            </div>
          ) : (
            paginated.map((item, idx) => (
              <div key={item.id || idx} className="px-4 py-4 hover:bg-surface-50/50 transition-colors">
                {renderMobileCard(item, actions)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100 bg-surface-50/50 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
              className="bg-white border border-surface-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>· {(safePage - 1) * size + 1}–{Math.min(safePage * size, sorted.length)} of {sorted.length}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (safePage <= 3) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = safePage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    pageNum === safePage
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-surface-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
