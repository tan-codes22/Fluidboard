import { Grid2x2, Maximize, Minus, Plus } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { IconButton } from '@/components/ui/IconButton';

export function ZoomControls() {
  const scale = useEditorStore((s) => s.viewport.scale);
  const zoomAt = useEditorStore((s) => s.zoomAt);
  const resetView = useEditorStore((s) => s.resetView);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);

  const center = (): [number, number] => [window.innerWidth / 2, window.innerHeight / 2];

  return (
    <div className="panel pointer-events-auto flex items-center gap-0.5 p-1">
      <IconButton label="Toggle grid" active={showGrid} onClick={toggleGrid}>
        <Grid2x2 size={18} />
      </IconButton>
      <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
      <IconButton
        label="Zoom out"
        shortcut="Ctrl -"
        onClick={() => zoomAt(1 / 1.2, ...center())}
      >
        <Minus size={18} />
      </IconButton>
      <button
        type="button"
        onClick={resetView}
        className="min-w-[3.5rem] rounded-lg px-2 py-1 text-sm font-medium tabular-nums text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        title="Reset zoom (Ctrl 0)"
      >
        {Math.round(scale * 100)}%
      </button>
      <IconButton
        label="Zoom in"
        shortcut="Ctrl +"
        onClick={() => zoomAt(1.2, ...center())}
      >
        <Plus size={18} />
      </IconButton>
      <IconButton label="Reset view" shortcut="Ctrl 0" onClick={resetView}>
        <Maximize size={18} />
      </IconButton>
    </div>
  );
}
