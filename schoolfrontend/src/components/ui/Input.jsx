import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Production-grade Input component.
 *
 * Features:
 *   - Label + optional required indicator
 *   - Hint text below label
 *   - Error message with icon
 *   - Left icon slot
 *   - Right element slot (e.g. show/hide password toggle)
 *   - Disabled state
 *
 * @example
 *   <Input label="Email" required error={errors.email} onChange={...} />
 *   <Input label="Password" type="password" hint="At least 8 characters" />
 *   <Input label="Search" icon={Search} rightElement={<kbd>⌘K</kbd>} />
 */

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    required = false,
    icon: Icon,
    rightElement,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-500 mb-1">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={[
            'w-full py-2.5 rounded-lg bg-slate-50 border text-sm',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-300',
            'transition-all hover:bg-surface-50/50',
            Icon ? 'pl-10 pr-3' : 'px-3',
            rightElement ? 'pr-12' : '',
            error
              ? 'border-red-300 bg-red-50/50 focus:ring-red-500/30 focus:border-red-300'
              : 'border-slate-200',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5" role="alert">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
