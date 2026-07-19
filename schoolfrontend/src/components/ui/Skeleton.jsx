/**
 * Skeleton loading components for consistent loading states.
 *
 * @example Table loading
 *   <Skeleton.Table rows={5} cols={4} />
 *
 * @example Card grid loading
 *   <Skeleton.CardGrid count={4} />
 *
 * @example Form loading
 *   <Skeleton.Form fields={4} />
 *
 * @example Inline text loading
 *   <Skeleton.Text lines={3} />
 */

function SkeletonBase({ className = '' }) {
  return <div className={`animate-pulse bg-surface-200 rounded ${className}`} />;
}

function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100">
        <SkeletonBase className="h-9 w-64" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-5 py-4 border-b border-surface-50 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBase key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <SkeletonBase className="w-11 h-11 rounded-xl" />
            <SkeletonBase className="w-12 h-5 rounded-full" />
          </div>
          <SkeletonBase className="h-7 w-20 mb-2" />
          <SkeletonBase className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <SkeletonBase className="h-4 w-16 mb-2" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <SkeletonBase className="flex-1 h-10 rounded-lg" />
        <SkeletonBase className="flex-1 h-10 rounded-lg" />
      </div>
    </div>
  );
}

function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className="h-4 rounded" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

const Skeleton = {
  Table: TableSkeleton,
  CardGrid: CardGridSkeleton,
  Form: FormSkeleton,
  Text: TextSkeleton,
};

export default Skeleton;
