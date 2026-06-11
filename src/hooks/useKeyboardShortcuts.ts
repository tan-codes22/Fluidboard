import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { TOOLS } from '@/lib/constants';
import type { ToolType } from '@/types';

const SHORTCUT_TO_TOOL = new Map<string, ToolType>(
  TOOLS.map((t) => [t.shortcut.toLowerCase(), t.id]),
);

/** Returns true while the user is typing into an input/textarea/editable. */
function isEditingText(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Global editor keyboard shortcuts: tool selection, undo/redo, delete,
 * select-all, and zoom. Disabled while editing text so typing isn't hijacked.
 */
export function useKeyboardShortcuts(): void {
  const store = useEditorStore;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (isEditingText(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const s = store.getState();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod && key === 'a') {
        e.preventDefault();
        s.setTool('select');
        s.setSelected(s.elements.map((el) => el.id));
        return;
      }
      if (mod && (key === '=' || key === '+')) {
        e.preventDefault();
        s.zoomAt(1.2, window.innerWidth / 2, window.innerHeight / 2);
        return;
      }
      if (mod && key === '-') {
        e.preventDefault();
        s.zoomAt(1 / 1.2, window.innerWidth / 2, window.innerHeight / 2);
        return;
      }
      if (mod && key === '0') {
        e.preventDefault();
        s.resetView();
        return;
      }

      if (mod) return; // Leave other browser shortcuts alone.

      if (key === 'delete' || key === 'backspace') {
        if (s.selectedIds.size > 0) {
          e.preventDefault();
          s.deleteSelected();
        }
        return;
      }
      if (key === 'escape') {
        s.clearSelection();
        return;
      }

      const tool = SHORTCUT_TO_TOOL.get(key);
      if (tool) {
        e.preventDefault();
        s.setTool(tool);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store]);
}
