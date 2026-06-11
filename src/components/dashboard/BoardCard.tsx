import { useEffect, useRef, useState } from 'react';
import { Copy, MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react';
import type { Board } from '@/types';
import { formatRelativeTime } from '@/lib/format';
import { BoardThumbnail } from './BoardThumbnail';

interface BoardCardProps {
  board: Board;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function BoardCard({
  board,
  onOpen,
  onRename,
  onDuplicate,
  onShare,
  onDelete,
}: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const runAction = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="panel group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <button
        onClick={onOpen}
        className="block aspect-[16/9] w-full overflow-hidden border-b border-slate-200/70 bg-slate-50 text-left dark:border-slate-700/60 dark:bg-slate-900"
        aria-label={`Open ${board.name}`}
      >
        {board.elements.length > 0 ? (
          <BoardThumbnail elements={board.elements} />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-slate-400">
            Empty board
          </span>
        )}
      </button>

      <div className="flex items-start justify-between gap-2 p-4">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-medium">{board.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {board.elements.length} item{board.elements.length === 1 ? '' : 's'} ·{' '}
            {formatRelativeTime(board.updatedAt)}
          </p>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Board options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="panel absolute right-0 top-9 z-10 w-44 animate-fade-in overflow-hidden p-1.5"
            >
              <MenuItem icon={<Pencil size={15} />} onClick={runAction(onRename)}>
                Rename
              </MenuItem>
              <MenuItem icon={<Copy size={15} />} onClick={runAction(onDuplicate)}>
                Duplicate
              </MenuItem>
              <MenuItem icon={<Share2 size={15} />} onClick={runAction(onShare)}>
                Share link
              </MenuItem>
              <MenuItem icon={<Trash2 size={15} />} onClick={runAction(onDelete)} danger>
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
