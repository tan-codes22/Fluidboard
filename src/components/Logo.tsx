import clsx from 'clsx';
import { APP_NAME } from '@/lib/env';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#logo-grad)" />
        <path
          d="M18 42 L30 22 L38 34 L44 26"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="26" r="3.5" fill="#fff" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      )}
    </span>
  );
}
