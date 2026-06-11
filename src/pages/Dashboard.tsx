import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useBoardStore } from '@/store/useBoardStore';
import { useToast } from '@/store/useToast';
import { buildShareUrl } from '@/lib/share';
import { copyToClipboard } from '@/lib/clipboard';
import { APP_NAME } from '@/lib/env';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toaster } from '@/components/Toaster';
import { BoardCard } from '@/components/dashboard/BoardCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const boards = useBoardStore((s) => s.boards);
  const createBoard = useBoardStore((s) => s.createBoard);
  const deleteBoard = useBoardStore((s) => s.deleteBoard);
  const duplicateBoard = useBoardStore((s) => s.duplicateBoard);
  const renameBoard = useBoardStore((s) => s.renameBoard);
  const notify = useToast((s) => s.notify);

  const [query, setQuery] = useState('');
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sortedBoards = useMemo(
    () => Object.values(boards).sort((a, b) => b.updatedAt - a.updatedAt),
    [boards],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? sortedBoards.filter((b) => b.name.toLowerCase().includes(q))
      : sortedBoards;
  }, [sortedBoards, query]);

  const handleCreate = () => {
    const id = createBoard('Untitled board');
    navigate(`/board/${id}`);
  };

  const handleShare = async (boardId: string) => {
    const board = boards[boardId];
    if (!board) return;
    const ok = await copyToClipboard(buildShareUrl(board));
    notify(
      ok ? 'Share link copied to clipboard' : 'Could not copy link',
      ok ? 'success' : 'error',
    );
  };

  const handleDuplicate = (boardId: string) => {
    const id = duplicateBoard(boardId);
    if (id) notify('Board duplicated', 'success');
  };

  const openRename = (boardId: string) => {
    setRenameTarget(boardId);
    setRenameValue(boards[boardId]?.name ?? '');
  };

  const confirmRename = () => {
    if (renameTarget) renameBoard(renameTarget, renameValue);
    setRenameTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteBoard(deleteTarget);
      notify('Board deleted', 'info');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="primary"
              onClick={handleCreate}
              className="hidden sm:inline-flex"
            >
              <Plus size={18} /> New board
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Welcome to {APP_NAME}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your boards
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Sketch ideas, diagrams, and notes. Everything is saved automatically to your
            browser — no account required.
          </p>
        </section>

        {sortedBoards.length > 0 && (
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search boards…"
                aria-label="Search boards"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <Button variant="primary" onClick={handleCreate} className="sm:hidden">
              <Plus size={18} /> New
            </Button>
          </div>
        )}

        {sortedBoards.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">
            No boards match “{query}”.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() => navigate(`/board/${board.id}`)}
                onRename={() => openRename(board.id)}
                onDuplicate={() => handleDuplicate(board.id)}
                onShare={() => handleShare(board.id)}
                onDelete={() => setDeleteTarget(board.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename board"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmRename();
          }}
        >
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Board name"
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete board?"
        description="This permanently removes the board from this browser. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      <Toaster />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="rounded-2xl bg-brand-50 p-4 dark:bg-brand-950/40">
        <Sparkles className="h-8 w-8 text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">No boards yet</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your first board to start sketching.
        </p>
      </div>
      <Button variant="primary" onClick={onCreate}>
        <Plus size={18} /> Create a board
      </Button>
    </div>
  );
}
