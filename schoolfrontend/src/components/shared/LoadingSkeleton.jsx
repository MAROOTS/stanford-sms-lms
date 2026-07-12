export function TableSkeleton({ columns = 3, rows = 5 }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
            {/* Header */}
            <div className="flex px-6 py-3 border-b border-slate-100 gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="h-3 bg-slate-200 rounded flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex px-6 py-4 border-b border-slate-50 last:border-0 gap-4">
                    {Array.from({ length: columns }).map((_, c) => (
                        <div key={c} className="h-4 bg-slate-100 rounded flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton({ count = 4 }) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-200" />
                        <div className="w-12 h-5 rounded-full bg-slate-200" />
                    </div>
                    <div className="h-7 bg-slate-200 rounded w-20 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-24" />
                </div>
            ))}
        </div>
    );
}

export function FormSkeleton({ fields = 4 }) {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                    <div className="h-10 bg-slate-100 rounded-lg" />
                </div>
            ))}
            <div className="flex gap-3 pt-2">
                <div className="flex-1 h-10 bg-slate-200 rounded-lg" />
                <div className="flex-1 h-10 bg-slate-300 rounded-lg" />
            </div>
        </div>
    );
}
