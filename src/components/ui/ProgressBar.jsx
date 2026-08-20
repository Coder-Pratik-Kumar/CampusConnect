import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showValue = true,
  color = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
    tertiary: 'bg-brand-tertiary',
    gradient: 'bg-gradient-to-r from-brand-primary to-brand-primary-container',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          {label && <span>{label}</span>}
          {showValue && <span className="font-semibold text-brand-primary">{percentage}%</span>}
        </div>
      )}

      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden p-0.5', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
