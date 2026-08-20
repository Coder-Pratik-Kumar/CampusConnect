import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  id,
  className,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
          {required && <span className="text-brand-error ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full bg-white border border-brand-border rounded-std px-3.5 py-2 text-sm text-brand-text placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:bg-slate-50 disabled:cursor-not-allowed',
            Icon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-brand-error focus:ring-brand-error/20 focus:border-brand-error',
            className
          )}
          {...props}
        />

        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            tabIndex={onRightIconClick ? 0 : -1}
          >
            <RightIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-brand-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-brand-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
