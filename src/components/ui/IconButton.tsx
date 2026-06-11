import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for accessibility — also used as the native tooltip. */
  label: string;
  active?: boolean;
  /** Optional keyboard hint appended to the tooltip, e.g. "V". */
  shortcut?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, active, shortcut, className, ...props }, ref) {
    const title = shortcut ? `${label} (${shortcut})` : label;
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={active}
        title={title}
        className={clsx(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          'focus-visible:ring-2 focus-visible:ring-brand-500',
          active
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className,
        )}
        {...props}
      />
    );
  },
);
