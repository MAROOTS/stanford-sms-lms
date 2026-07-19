import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Production-grade Select component.
 *
 * @example
 *   <Select label="Class" required error={errors.class}>
 *     <option value="">Select...</option>
 *     {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 *   </Select>
 */

const Select = forwardRef(function Select(
  {
    label,
    error,
    required = false,
    children,
    className = '',
    id,
    disabled = false,
    placeholder,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-slate-500 mb-1">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={[
            'w-full pl-3 pr-9 py-2.5 rounded-lg bg-slate-50 border text-sm appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300',
            'transition-all cursor-pointer',
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-500/30 focus:border-red-300'
              : 'border-slate-200',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5" role="alert">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
