import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Viewport } from '@/lib/drawing';
import { useEditorStore } from '@/store/useEditorStore';

interface TextDraft {
  x: number;
  y: number;
  value: string;
  id: string | null;
}

interface Props {
  draft: TextDraft;
  viewport: Viewport;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

/**
 * A textarea overlaid on the canvas at the text element's world position.
 * Styling mirrors the canvas text rendering so editing feels in-place.
 */
export function TextEditorOverlay({
  draft,
  viewport,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fontSize = useEditorStore((s) => s.fontSize);
  const color = useEditorStore((s) => s.strokeColor);

  // Focus and place the caret at the end when editing begins.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // Grow the textarea to fit its content.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.value, fontSize, viewport.scale]);

  const scaledFont = fontSize * viewport.scale;
  const left = draft.x * viewport.scale + viewport.offsetX;
  const top = draft.y * viewport.scale + viewport.offsetY;

  return (
    <textarea
      ref={ref}
      value={draft.value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onCommit();
        }
        e.stopPropagation();
      }}
      spellCheck={false}
      placeholder="Type…"
      aria-label="Text editor"
      className="absolute z-10 resize-none overflow-hidden whitespace-pre border-none bg-transparent p-0 leading-tight outline-none placeholder:text-slate-400"
      style={{
        left,
        top,
        color,
        fontSize: scaledFont,
        lineHeight: 1.25,
        fontFamily: 'Inter, system-ui, sans-serif',
        minWidth: 4,
      }}
    />
  );
}
