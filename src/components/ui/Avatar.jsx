import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const Avatar = ({
  src,
  name = 'Student',
  size = 'md',
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'S';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg font-semibold',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5 ring-1',
    sm: 'h-2 w-2 ring-1.5',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-indigo-100 text-brand-primary font-semibold overflow-hidden border border-indigo-200/50 select-none shadow-xs',
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusSizes[size],
            statusColors[status] || statusColors.online
          )}
        />
      )}
    </div>
  );
};
