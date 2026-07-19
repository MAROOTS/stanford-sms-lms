/**
 * Production-grade Badge component.
 *
 * Variants: neutral | success | warning | danger | info | brand
 * Sizes:    sm | md
 *
 * @example
 *   <Badge>Active</Badge>
 *   <Badge variant="success">Paid</Badge>
 *   <Badge variant="danger" size="sm">Overdue</Badge>
 *   <Badge variant="brand" dot>Live</Badge>
 */

const variantStyles = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  brand: 'bg-accent-50 text-accent-700 border-accent-200',
};

const dotColors = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  brand: 'bg-accent-500',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
}) {
  const sizeStyles = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        sizeStyles,
        variantStyles[variant] || variantStyles.neutral,
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
