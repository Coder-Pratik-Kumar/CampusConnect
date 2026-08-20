import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hoverEffect = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-brand-surface rounded-card border border-brand-border shadow-soft transition-all duration-200 overflow-hidden',
        hoverEffect && 'hover:shadow-soft-md hover:border-indigo-100 transform hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6 pb-3 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, as: Component = 'h3', ...props }) => {
  return (
    <Component className={cn('text-lg font-bold font-heading text-brand-text tracking-tight', className)} {...props}>
      {children}
    </Component>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-sm text-brand-muted mt-1 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
};
