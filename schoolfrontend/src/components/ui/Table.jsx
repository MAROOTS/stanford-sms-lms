import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import EmptyState from '../../components/shared/EmptyState';

/**
 * Production-grade data table with built-in loading, empty, error states.
 *
 * Features:
 *   - Client-side search/filter
 *   - Column sorting (click headers)
 *   - Pagination with configurable page size
 *   - Loading skeleton rows
 *   - Empty state with icon + message
 *   - Error state with retry
 *   - Responsive: table on desktop, card list on mobile (via renderMobile prop)
 *   - Row actions (view, edit, delete)
 *
 * @example
 *   <Table
 *     columns={[
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'email', label: 'Email' },
 *     ]}
 *     data={students}
 *     loading={loading}
 *     error={error}
 *     onRetry={load}
 *     searchFields={['name', 'email']}
 *     emptyIcon={Users}
 *     emptyTitle="No students yet"
 *     onView={(item) => openView(item)}
 *     onEdit={(item) => openEdit(item)}
 *     onDelete={(item) => setDeleteTarget(item)}
 *   />
 */

export default function Table({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry,
  searchFields = [],
  searchPlaceholder = 'Search...',
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  renderMobileCard,
  onView,
  onEdit,
  onDelete,
  rowClassName,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

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

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), undefined, { numeric: true })
        : String(vb).localeCompare(String(va), undefined, { numeric: true });
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * size, safePage * size);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const hasActions = onView || onEdit || onDelete;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-surface-100">
          <div className="h-9 bg-surface-200 rounded-lg w-64" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-surface-50 flex gap-4">
            {Array.from({ length: columns.length + (hasActions ? 1 : 0) }).map((_, j) => (
              <div key={j} className="h-4 bg-surface-100 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <p className="text-red-600 text-sm mb-3 font-medium">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm font-semibold text-red-700 hover:text-red-800 underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      {/* Search toolbar */}
      {searchFields.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-surface-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            />
          </div>
          {filtered.length !== data.length && (
            <span className="text-xs text-slate-500 whitespace-nowrap">{filtered.length} of {data.length}</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 ${col.sortable ? 'cursor-pointer select-none hover:text-slate-600 transition-colors' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={12} className="text-accent-500" /> : <ChevronDown size={12} className="text-accent-500" />)
                        : <ChevronDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
              ))}
              {hasActions && <th className="px-5 py-3 text-right w-10">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-5 py-16">
                  <EmptyState
                    icon={emptyIcon}
                    title={search ? 'No matches' : emptyTitle}
                    description={search ? `No results for "${search}"` : emptyDescription}
                    action={!search && emptyAction ? emptyAction : undefined}
                  />
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id || idx} className={`border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors ${rowClassName || ''}`}>
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button onClick={() => onView(item)} title="View" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} title="Delete" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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

      {/* Mobile cards (when renderMobileCard is provided) */}
      {renderMobileCard && paginated.length > 0 && (
        <div className="md:hidden divide-y divide-surface-100">
          {paginated.map((item, idx) => (
            <div key={item.id || idx} className="px-4 py-4 hover:bg-surface-50/50">
              {renderMobileCard(item, { onView, onEdit, onDelete })}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100 bg-surface-50/50 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
              className="bg-white border border-surface-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>· {(safePage - 1) * size + 1}–{Math.min(safePage * size, sorted.length)} of {sorted.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed" title="First"><ChevronsLeft size={14} /></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Previous"><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let num;
              if (totalPages <= 5) num = i + 1;
              else if (safePage <= 3) num = i + 1;
              else if (safePage >= totalPages - 2) num = totalPages - 4 + i;
              else num = safePage - 2 + i;
              return (
                <button key={num} onClick={() => setPage(num)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${num === safePage ? 'bg-accent-500 text-white shadow-sm' : 'text-slate-600 hover:bg-surface-100'}`}>
                  {num}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Next"><ChevronRight size={14} /></button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed" title="Last"><ChevronsRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
