import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Button component for CampusConnect design system.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-std select-none';

  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary shadow-sm',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-hover focus:ring-brand-secondary shadow-sm',
    outline: 'border border-brand-border bg-white text-brand-text hover:bg-brand-surface-hover hover:border-slate-300 focus:ring-brand-primary',
    ghost: 'text-brand-text hover:bg-brand-surface-hover focus:ring-brand-primary',
    danger: 'bg-brand-error text-white hover:bg-red-700 focus:ring-brand-error shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 gap-2 font-medium',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={cn('h-4 w-4 shrink-0', size === 'lg' && 'h-5 w-5', size === 'sm' && 'h-3.5 w-3.5')} />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn('h-4 w-4 shrink-0', size === 'lg' && 'h-5 w-5', size === 'sm' && 'h-3.5 w-3.5')} />
      )}
    </button>
  );
};
