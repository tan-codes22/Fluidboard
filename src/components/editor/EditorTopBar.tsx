import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Keyboard, Redo2, Share2, Trash2, Undo2 } from 'lucide-react';
import type { SaveStatus } from '@/hooks/useAutoSave';
import { useEditorStore } from '@/store/useEditorStore';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { ExportMenu } from './ExportMenu';

interface Props {
  boardName: string;
  saveStatus: SaveStatus;
  onRename: (name: string) => void;
  onShare: () => void;
  onShowShortcuts: () => void;
}

export function EditorTopBar({
  boardName,
  saveStatus,
  onRename,
  onShare,
  onShowShortcuts,
}: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState(boardName);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const clearBoard = useEditorStore((s) => s.clearBoard);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const hasElements = useEditorStore((s) => s.elements.length > 0);

  useEffect(() => setName(boardName), [boardName]);

  const commitName = () => {
    const trimmed = name.trim() || 'Untitled board';
    setName(trimmed);
    if (trimmed !== boardName) onRename(trimmed);
  };

  return (
    <header className="z-30 flex items-center justify-between gap-2 border-b border-slate-200/70 bg-white/80 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex min-w-0 items-center gap-1.5">
        <IconButton label="Back to dashboard" onClick={() => navigate('/')}>
          <ChevronLeft size={20} />
        </IconButton>
        <Logo showWordmark={false} className="hidden sm:inline-flex" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          aria-label="Board name"
          className="min-w-0 max-w-[40vw] truncate rounded-lg bg-transparent px-2 py-1 text-sm font-medium outline-none hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800"
        />
        <span
          className="hidden whitespace-nowrap text-xs text-slate-400 sm:inline"
          aria-live="polite"
        >
          {saveStatus === 'saving' ? 'Saving…' : 'All changes saved'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <IconButton label="Undo" shortcut="Ctrl Z" onClick={undo} disabled={!canUndo}>
          <Undo2 size={18} />
        </IconButton>
        <IconButton
          label="Redo"
          shortcut="Ctrl Shift Z"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo2 size={18} />
        </IconButton>
        <IconButton
          label="Clear canvas"
          onClick={clearBoard}
          disabled={!hasElements}
          className="hidden sm:inline-flex"
        >
          <Trash2 size={18} />
        </IconButton>
        <span className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
        <IconButton
          label="Keyboard shortcuts"
          onClick={onShowShortcuts}
          className="hidden md:inline-flex"
        >
          <Keyboard size={18} />
        </IconButton>
        <ThemeToggle />
        <Button size="sm" variant="secondary" onClick={onShare}>
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <ExportMenu boardName={boardName} />
      </div>
    </header>
  );
}
