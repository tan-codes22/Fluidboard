import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBoardStore } from '@/store/useBoardStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { ZoomControls } from '@/components/editor/ZoomControls';
import { EditorTopBar } from '@/components/editor/EditorTopBar';
import { ShareDialog } from '@/components/editor/ShareDialog';
import { ShortcutsDialog } from '@/components/editor/ShortcutsDialog';
import { Toaster } from '@/components/Toaster';

export default function Editor() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const board = useBoardStore((s) => (boardId ? s.boards[boardId] : undefined));
  const renameBoard = useBoardStore((s) => s.renameBoard);
  const loadBoard = useEditorStore((s) => s.loadBoard);
  const loadedBoardId = useEditorStore((s) => s.boardId);

  const [shareOpen, setShareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const saveStatus = useAutoSave();
  useKeyboardShortcuts();

  // Redirect to 404 when the board id is unknown.
  useEffect(() => {
    if (boardId && !board) navigate('/404', { replace: true });
  }, [boardId, board, navigate]);

  // Load the board's elements into the editor when it changes.
  useEffect(() => {
    if (board && loadedBoardId !== board.id) loadBoard(board);
  }, [board, loadedBoardId, loadBoard]);

  if (!board) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <EditorTopBar
        boardName={board.name}
        saveStatus={saveStatus}
        onRename={(name) => renameBoard(board.id, name)}
        onShare={() => setShareOpen(true)}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />

      <div className="relative min-h-0 flex-1">
        <Canvas />

        {/* Tool palette — top center on desktop, bottom center on smaller screens. */}
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-3 max-lg:top-auto max-lg:bottom-4">
          <Toolbar />
        </div>

        {/* Properties — anchored left on desktop, top center on smaller screens. */}
        <div className="pointer-events-none absolute left-4 top-4 hidden lg:block">
          <PropertiesPanel />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-3 lg:hidden">
          <div className="max-w-[92vw] overflow-x-auto">
            <PropertiesPanel />
          </div>
        </div>

        {/* Zoom + view controls — bottom left on desktop, top right on mobile. */}
        <div className="pointer-events-none absolute bottom-4 left-4 max-lg:bottom-auto max-lg:left-auto max-lg:right-4 max-lg:top-4">
          <ZoomControls />
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        boardName={board.name}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Toaster />
    </div>
  );
}
