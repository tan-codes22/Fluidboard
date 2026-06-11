import { create } from 'zustand';
import { createId } from '@/lib/id';

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: Toast[];
  notify: (message: string, variant?: Toast['variant']) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  notify: (message, variant = 'info') => {
    const id = createId();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    window.setTimeout(() => get().dismiss(id), 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
