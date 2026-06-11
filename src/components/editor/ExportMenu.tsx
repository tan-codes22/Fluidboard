import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, FileImage, FileText } from 'lucide-react';
import { exportToPDF, exportToPNG } from '@/lib/export';
import { CANVAS_BG } from '@/lib/constants';
import { useEditorStore } from '@/store/useEditorStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useToast } from '@/store/useToast';
import { Button } from '@/components/ui/Button';

interface Props {
  boardName: string;
}

export function ExportMenu({ boardName }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const notify = useToast((s) => s.notify);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const run = async (kind: 'png' | 'pdf') => {
    setOpen(false);
    const elements = useEditorStore.getState().elements;
    if (elements.length === 0) {
      notify('Nothing to export — the board is empty', 'info');
      return;
    }
    setBusy(true);
    try {
      const bg = CANVAS_BG[theme];
      const ok =
        kind === 'png'
          ? exportToPNG(elements, boardName, bg)
          : await exportToPDF(elements, boardName, bg);
      notify(
        ok ? `Exported as ${kind.toUpperCase()}` : 'Export failed',
        ok ? 'success' : 'error',
      );
    } catch {
      notify('Export failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown size={14} />
      </Button>
      {open && (
        <div
          role="menu"
          className="panel absolute right-0 top-10 z-20 w-44 animate-fade-in p-1.5"
        >
          <button
            role="menuitem"
            onClick={() => run('png')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileImage size={16} /> Export as PNG
          </button>
          <button
            role="menuitem"
            onClick={() => run('pdf')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText size={16} /> Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
