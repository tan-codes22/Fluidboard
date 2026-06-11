import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useBoardStore } from '@/store/useBoardStore';

export type SaveStatus = 'saved' | 'saving';

/**
 * Debounced auto-save: persists the active board's elements to the board store
 * shortly after edits stop. Skips the initial write triggered by loading a
 * board so merely opening one doesn't bump its "updated" timestamp.
 */
export function useAutoSave(delay = 600): SaveStatus {
  const boardId = useEditorStore((s) => s.boardId);
  const elements = useEditorStore((s) => s.elements);
  const saveElements = useBoardStore((s) => s.saveElements);
  const [status, setStatus] = useState<SaveStatus>('saved');
  const lastBoard = useRef<string | null>(null);

  useEffect(() => {
    if (!boardId) return;
    if (lastBoard.current !== boardId) {
      lastBoard.current = boardId;
      return;
    }
    setStatus('saving');
    const timer = window.setTimeout(() => {
      saveElements(boardId, elements);
      setStatus('saved');
    }, delay);
    return () => window.clearTimeout(timer);
  }, [boardId, elements, saveElements, delay]);

  return status;
}
