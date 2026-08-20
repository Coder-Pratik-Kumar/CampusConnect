import React from 'react';
import { cn } from '../../utils/cn';
import { BookOpen, Sparkles, X } from 'lucide-react';

export const SkillTag = ({
  name,
  type = 'teach', // 'teach' | 'learn'
  level,
  onRemove,
  size = 'md',
  className,
  ...props
}) => {
  const isTeach = type === 'teach';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-std border px-3 py-1 text-xs font-medium transition-all duration-150',
        isTeach
          ? 'bg-indigo-50/80 border-indigo-200/60 text-brand-primary'
          : 'bg-emerald-50/80 border-emerald-200/60 text-brand-secondary',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        className
      )}
      {...props}
    >
      {isTeach ? (
        <Sparkles className="h-3.5 w-3.5 text-brand-primary shrink-0" />
      ) : (
        <BookOpen className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
      )}

      <span className="font-medium">{name}</span>

      {level && (
        <span className="text-[10px] opacity-75 font-normal px-1 py-0.2 bg-white/60 rounded">
          {level}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/5 transition-colors focus:outline-none"
          title={`Remove ${name}`}
        >
          <X className="h-3 w-3 opacity-60 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};
