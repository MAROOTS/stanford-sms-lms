import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Production-grade Button component.
 *
 * Variants: primary | accent | secondary | ghost | danger
 * Sizes:    sm | md | lg
 * Loading:  pass `loading` to show spinner + disable
 *
 * @example
 *   <Button variant="primary" size="md" onClick={handleSave}>
 *     Save changes
 *   </Button>
 *
 *   <Button variant="danger" loading={deleting} onClick={handleDelete}>
 *     Delete
 *   </Button>
 *
 *   <Button variant="ghost" size="sm" icon={<Eye size={14} />} aria-label="View" />
 */

const variantStyles = {
  primary: 'bg-primary-800 hover:bg-primary-700 text-white shadow-sm shadow-primary-900/10',
  accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm shadow-accent-500/20',
  secondary: 'bg-white border border-surface-200 text-slate-700 hover:bg-surface-50 shadow-sm',
  ghost: 'text-slate-500 hover:text-slate-700 hover:bg-surface-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20',
};

const sizeStyles = {
  sm: 'text-xs px-3 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-sm px-5 py-3 rounded-xl gap-2.5',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    children,
    className = '',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const Spinner = loading ? <Loader2 size={size === 'sm' ? 12 : 16} className="animate-spin shrink-0" /> : null;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className,
      ].join(' ')}
      {...props}
    >
      {Spinner || (Icon ? <Icon size={size === 'sm' ? 14 : 16} aria-hidden="true" className="shrink-0" /> : null)}
      {children && <span>{children}</span>}
      {IconRight && !loading ? <IconRight size={size === 'sm' ? 12 : 16} aria-hidden="true" className="shrink-0" /> : null}
    </button>
  );
});

export default Button;
