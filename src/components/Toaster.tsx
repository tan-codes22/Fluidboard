import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useToast } from '@/store/useToast';

const icons = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-brand-500" />,
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="panel pointer-events-auto flex animate-fade-in items-center gap-2.5 px-4 py-2.5 text-sm"
        >
          {icons[toast.variant]}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
