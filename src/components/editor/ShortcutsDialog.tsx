import { Modal } from '@/components/ui/Modal';
import { TOOLS } from '@/lib/constants';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACTIONS: { keys: string; label: string }[] = [
  { keys: 'Ctrl / ⌘ + Z', label: 'Undo' },
  { keys: 'Ctrl / ⌘ + Shift + Z', label: 'Redo' },
  { keys: 'Ctrl / ⌘ + A', label: 'Select all' },
  { keys: 'Delete / Backspace', label: 'Delete selection' },
  { keys: 'Ctrl / ⌘ + Scroll', label: 'Zoom in / out' },
  { keys: 'Space + Drag', label: 'Pan canvas' },
  { keys: 'Ctrl / ⌘ + 0', label: 'Reset view' },
  { keys: 'Double-click', label: 'Add / edit text' },
  { keys: 'Esc', label: 'Clear selection' },
];

function Row({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {keys}
      </kbd>
    </div>
  );
}

export function ShortcutsDialog({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Tools
          </p>
          {TOOLS.map((t) => (
            <Row key={t.id} keys={t.shortcut} label={t.label} />
          ))}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Actions
          </p>
          {ACTIONS.map((a) => (
            <Row key={a.label} keys={a.keys} label={a.label} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
