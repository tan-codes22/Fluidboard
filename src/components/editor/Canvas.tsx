import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Bounds,
  PenElement,
  Point,
  ShapeElement,
  TextElement,
  WBElement,
} from '@/types';
import { renderScene } from '@/lib/drawing';
import { getElementAtPosition, getElementsInBox, translateElement } from '@/lib/geometry';
import { createId } from '@/lib/id';
import { CANVAS_BG, GRID_COLOR } from '@/lib/constants';
import { useEditorStore } from '@/store/useEditorStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useElementSize } from '@/hooks/useElementSize';
import { TextEditorOverlay } from './TextEditorOverlay';

/** In-flight pointer interaction, tracked imperatively to avoid re-renders. */
type Interaction =
  | { type: 'draw'; element: WBElement }
  | { type: 'move'; start: Point; ids: Set<string>; snapshot: WBElement[] }
  | { type: 'marquee'; start: Point; base: string[] }
  | { type: 'erase'; removed: Set<string>; snapshot: WBElement[] }
  | { type: 'pan'; startClient: Point; startOffset: Point };

interface Preview {
  override?: WBElement[];
  draft?: WBElement | null;
  marquee?: Bounds | null;
}

interface TextDraft {
  x: number;
  y: number;
  value: string;
  id: string | null;
}

const HIT_TOLERANCE = 8;
const CLICK_TOLERANCE = 4;

function normalizeBox(a: Point, b: Point): Bounds {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y),
  };
}

export function Canvas() {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interaction = useRef<Interaction | null>(null);
  const spaceDown = useRef(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [textDraft, setTextDraft] = useState<TextDraft | null>(null);

  // Reactive slices used for rendering.
  const elements = useEditorStore((s) => s.elements);
  const viewport = useEditorStore((s) => s.viewport);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const tool = useEditorStore((s) => s.tool);
  const showGrid = useEditorStore((s) => s.showGrid);
  const theme = useThemeStore((s) => s.theme);

  /** Converts a client (screen) coordinate to a world coordinate. */
  const toWorld = useCallback((clientX: number, clientY: number): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const vp = useEditorStore.getState().viewport;
    return {
      x: (clientX - rect.left - vp.offsetX) / vp.scale,
      y: (clientY - rect.top - vp.offsetY) / vp.scale,
    };
  }, []);

  // ----- Rendering -------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const wantW = Math.round(size.width * dpr);
    const wantH = Math.round(size.height * dpr);
    if (canvas.width !== wantW) canvas.width = wantW;
    if (canvas.height !== wantH) canvas.height = wantH;

    let display = preview?.override ?? elements;
    // The element being edited is drawn by the textarea overlay, not the canvas.
    if (textDraft?.id) display = display.filter((el) => el.id !== textDraft.id);

    renderScene(ctx, {
      elements: display,
      viewport,
      width: size.width,
      height: size.height,
      dpr,
      background: CANVAS_BG[theme],
      gridColor: GRID_COLOR[theme],
      showGrid,
      selectedIds,
      draft: preview?.draft ?? null,
      marquee: preview?.marquee ?? null,
    });
  }, [elements, viewport, size, theme, showGrid, selectedIds, preview, textDraft]);

  // ----- Space-to-pan ----------------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // ----- Wheel zoom / pan (native listener for preventDefault) -----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const store = useEditorStore.getState();
      const rect = canvas.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        store.zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
      } else {
        store.panBy(-e.deltaX, -e.deltaY);
      }
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ----- Text editing helpers -------------------------------------------
  const commitText = useCallback((draft: TextDraft) => {
    const store = useEditorStore.getState();
    const text = draft.value.replace(/\s+$/g, '');
    if (draft.id) {
      // Editing an existing label.
      if (!text) {
        store.commit(store.elements.filter((el) => el.id !== draft.id));
      } else {
        store.commit(
          store.elements.map((el) =>
            el.id === draft.id && el.type === 'text' ? { ...el, text } : el,
          ),
        );
      }
    } else if (text) {
      const el: TextElement = {
        id: createId(),
        type: 'text',
        x: draft.x,
        y: draft.y,
        text,
        strokeColor: store.strokeColor,
        strokeWidth: store.strokeWidth,
        opacity: store.opacity,
        fontSize: store.fontSize,
      };
      store.addElement(el);
    }
    setTextDraft(null);
    store.setTool('select');
  }, []);

  // ----- Pointer handlers ------------------------------------------------
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0 && e.button !== 1) return;
      const canvas = canvasRef.current!;
      canvas.setPointerCapture(e.pointerId);
      const store = useEditorStore.getState();
      const world = toWorld(e.clientX, e.clientY);

      // Panning: space-drag or middle mouse, regardless of active tool.
      if (spaceDown.current || e.button === 1) {
        interaction.current = {
          type: 'pan',
          startClient: { x: e.clientX, y: e.clientY },
          startOffset: { x: store.viewport.offsetX, y: store.viewport.offsetY },
        };
        return;
      }

      const thr = HIT_TOLERANCE / store.viewport.scale;
      const activeTool = store.tool;

      if (activeTool === 'select') {
        const hit = getElementAtPosition(world, store.elements, thr);
        if (hit) {
          let ids: string[];
          if (e.shiftKey) {
            ids = store.selectedIds.has(hit.id)
              ? [...store.selectedIds].filter((id) => id !== hit.id)
              : [...store.selectedIds, hit.id];
          } else {
            ids = store.selectedIds.has(hit.id) ? [...store.selectedIds] : [hit.id];
          }
          store.setSelected(ids);
          interaction.current = {
            type: 'move',
            start: world,
            ids: new Set(ids),
            snapshot: store.elements,
          };
        } else {
          if (!e.shiftKey) store.clearSelection();
          interaction.current = {
            type: 'marquee',
            start: world,
            base: e.shiftKey ? [...store.selectedIds] : [],
          };
          setPreview({ marquee: normalizeBox(world, world) });
        }
        return;
      }

      if (activeTool === 'eraser') {
        const snapshot = store.elements;
        const removed = new Set<string>();
        const hit = getElementAtPosition(world, snapshot, thr);
        if (hit) removed.add(hit.id);
        interaction.current = { type: 'erase', removed, snapshot };
        setPreview({ override: snapshot.filter((el) => !removed.has(el.id)) });
        return;
      }

      if (activeTool === 'text') {
        setTextDraft({ x: world.x, y: world.y, value: '', id: null });
        return;
      }

      // Drawing tools (pen + shapes).
      const base = {
        id: createId(),
        strokeColor: store.strokeColor,
        strokeWidth: store.strokeWidth,
        opacity: store.opacity,
      };
      let element: WBElement;
      if (activeTool === 'pen') {
        const pen: PenElement = { ...base, type: 'pen', points: [world] };
        element = pen;
      } else {
        const shape: ShapeElement = {
          ...base,
          type: activeTool,
          x1: world.x,
          y1: world.y,
          x2: world.x,
          y2: world.y,
          fillColor: store.fillColor,
        };
        element = shape;
      }
      interaction.current = { type: 'draw', element };
      setPreview({ draft: element });
    },
    [toWorld],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const current = interaction.current;
      if (!current) return;
      const store = useEditorStore.getState();
      const world = toWorld(e.clientX, e.clientY);

      switch (current.type) {
        case 'pan': {
          store.setViewport({
            scale: store.viewport.scale,
            offsetX: current.startOffset.x + (e.clientX - current.startClient.x),
            offsetY: current.startOffset.y + (e.clientY - current.startClient.y),
          });
          break;
        }
        case 'move': {
          const dx = world.x - current.start.x;
          const dy = world.y - current.start.y;
          const override = current.snapshot.map((el) =>
            current.ids.has(el.id) ? translateElement(el, dx, dy) : el,
          );
          setPreview({ override });
          break;
        }
        case 'marquee': {
          const box = normalizeBox(current.start, world);
          const within = getElementsInBox(box, store.elements).map((el) => el.id);
          store.setSelected([...new Set([...current.base, ...within])]);
          setPreview({ marquee: box });
          break;
        }
        case 'erase': {
          const thr = HIT_TOLERANCE / store.viewport.scale;
          const hit = getElementAtPosition(world, current.snapshot, thr);
          if (hit) current.removed.add(hit.id);
          setPreview({
            override: current.snapshot.filter((el) => !current.removed.has(el.id)),
          });
          break;
        }
        case 'draw': {
          const el = current.element;
          let next: WBElement;
          if (el.type === 'pen') {
            next = { ...el, points: [...el.points, world] };
          } else if (el.type === 'text') {
            next = el; // Text is never created via a drag interaction.
          } else {
            next = { ...el, x2: world.x, y2: world.y };
          }
          current.element = next;
          setPreview({ draft: next });
          break;
        }
      }
    },
    [toWorld],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const current = interaction.current;
      interaction.current = null;
      canvasRef.current?.releasePointerCapture(e.pointerId);
      if (!current) return;
      const store = useEditorStore.getState();

      switch (current.type) {
        case 'move': {
          if (preview?.override) store.commit(preview.override);
          break;
        }
        case 'erase': {
          if (current.removed.size > 0 && preview?.override)
            store.commit(preview.override);
          break;
        }
        case 'draw': {
          const el = current.element;
          // Discard accidental zero-size shapes from a click without a drag.
          const keep =
            el.type === 'pen' || el.type === 'text'
              ? true
              : Math.hypot(el.x2 - el.x1, el.y2 - el.y1) > CLICK_TOLERANCE;
          if (keep) store.addElement(el);
          break;
        }
        // 'marquee' and 'pan' need no commit — selection / viewport already set.
      }
      setPreview(null);
    },
    [preview],
  );

  const onDoubleClick = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const store = useEditorStore.getState();
      const world = toWorld(e.clientX, e.clientY);
      const thr = HIT_TOLERANCE / store.viewport.scale;
      const hit = getElementAtPosition(world, store.elements, thr);
      if (hit && hit.type === 'text') {
        store.setTool('select');
        setTextDraft({ x: hit.x, y: hit.y, value: hit.text, id: hit.id });
      } else if (!hit) {
        store.setTool('text');
        setTextDraft({ x: world.x, y: world.y, value: '', id: null });
      }
    },
    [toWorld],
  );

  const cursor = (() => {
    if (textDraft) return 'text';
    switch (tool) {
      case 'pen':
      case 'rectangle':
      case 'ellipse':
      case 'line':
      case 'arrow':
        return 'crosshair';
      case 'text':
        return 'text';
      case 'eraser':
        return 'cell';
      default:
        return 'default';
    }
  })();

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        role="img"
        aria-label="Drawing canvas"
      />
      {textDraft && (
        <TextEditorOverlay
          draft={textDraft}
          viewport={viewport}
          onChange={(value) => setTextDraft({ ...textDraft, value })}
          onCommit={() => commitText(textDraft)}
          onCancel={() => setTextDraft(null)}
        />
      )}
    </div>
  );
}
