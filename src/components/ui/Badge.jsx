import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-50 text-brand-primary border-indigo-100',
    secondary: 'bg-emerald-50 text-brand-secondary border-emerald-100',
    tertiary: 'bg-amber-50 text-brand-tertiary border-amber-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-brand-error border-rose-200',
    outline: 'bg-transparent text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-transparent select-none font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
