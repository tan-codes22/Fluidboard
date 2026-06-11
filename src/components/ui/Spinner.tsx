import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label, className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-slate-500 dark:text-slate-400',
        className,
      )}
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
