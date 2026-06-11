import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Board, ToolType, WBElement } from '@/types';
import type { Viewport } from '@/lib/drawing';
import { MAX_ZOOM, MIN_ZOOM, STORAGE_KEYS } from '@/lib/constants';

const HISTORY_LIMIT = 100;
const DEFAULT_VIEWPORT: Viewport = { scale: 1, offsetX: 0, offsetY: 0 };

/** Style attributes shared across tools, applied to newly created elements. */
export interface StylePrefs {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  opacity: number;
  fontSize: number;
}

interface EditorState extends StylePrefs {
  boardId: string | null;
  elements: WBElement[];
  past: WBElement[][];
  future: WBElement[][];
  selectedIds: Set<string>;
  tool: ToolType;
  showGrid: boolean;
  viewport: Viewport;

  loadBoard: (board: Board) => void;
  setTool: (tool: ToolType) => void;
  setStyle: (patch: Partial<StylePrefs>) => void;
  toggleGrid: () => void;

  commit: (next: WBElement[]) => void;
  addElement: (el: WBElement) => void;
  deleteSelected: () => void;
  clearBoard: () => void;
  applyStyleToSelected: (patch: Partial<StylePrefs>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  setSelected: (ids: string[]) => void;
  clearSelection: () => void;

  setViewport: (v: Viewport) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (factor: number, cx: number, cy: number) => void;
  setZoom: (scale: number, cx: number, cy: number) => void;
  resetView: () => void;
}

const clampZoom = (z: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      boardId: null,
      elements: [],
      past: [],
      future: [],
      selectedIds: new Set<string>(),
      tool: 'select',
      showGrid: true,
      viewport: { ...DEFAULT_VIEWPORT },

      // Persisted style prefs (see partialize below).
      strokeColor: '#1e1e1e',
      strokeWidth: 4,
      fillColor: 'transparent',
      opacity: 1,
      fontSize: 24,

      loadBoard: (board) =>
        set({
          boardId: board.id,
          elements: structuredClone(board.elements),
          past: [],
          future: [],
          selectedIds: new Set(),
          viewport: { ...DEFAULT_VIEWPORT },
          tool: 'select',
        }),

      setTool: (tool) =>
        set((s) => ({
          tool,
          selectedIds: tool === 'select' ? s.selectedIds : new Set(),
        })),

      setStyle: (patch) => set(patch),

      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

      commit: (next) =>
        set((s) => ({
          past: [...s.past, s.elements].slice(-HISTORY_LIMIT),
          elements: next,
          future: [],
        })),

      addElement: (el) => get().commit([...get().elements, el]),

      deleteSelected: () => {
        const { selectedIds, elements, commit } = get();
        if (selectedIds.size === 0) return;
        commit(elements.filter((e) => !selectedIds.has(e.id)));
        set({ selectedIds: new Set() });
      },

      clearBoard: () => {
        if (get().elements.length === 0) return;
        get().commit([]);
        set({ selectedIds: new Set() });
      },

      applyStyleToSelected: (patch) => {
        const { selectedIds, elements, commit } = get();
        if (selectedIds.size === 0) return;
        commit(
          elements.map((el) => {
            if (!selectedIds.has(el.id)) return el;
            const next = { ...el } as WBElement;
            if (patch.strokeColor !== undefined) next.strokeColor = patch.strokeColor;
            if (patch.strokeWidth !== undefined) next.strokeWidth = patch.strokeWidth;
            if (patch.opacity !== undefined) next.opacity = patch.opacity;
            if (patch.fillColor !== undefined && 'fillColor' in next)
              next.fillColor = patch.fillColor;
            if (patch.fontSize !== undefined && next.type === 'text')
              next.fontSize = patch.fontSize;
            return next;
          }),
        );
      },

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s;
          const previous = s.past[s.past.length - 1];
          return {
            past: s.past.slice(0, -1),
            elements: previous,
            future: [s.elements, ...s.future].slice(0, HISTORY_LIMIT),
            selectedIds: new Set(),
          };
        }),

      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s;
          const next = s.future[0];
          return {
            past: [...s.past, s.elements].slice(-HISTORY_LIMIT),
            elements: next,
            future: s.future.slice(1),
            selectedIds: new Set(),
          };
        }),

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      setSelected: (ids) => set({ selectedIds: new Set(ids) }),
      clearSelection: () => set({ selectedIds: new Set() }),

      setViewport: (v) => set({ viewport: v }),

      panBy: (dx, dy) =>
        set((s) => ({
          viewport: {
            ...s.viewport,
            offsetX: s.viewport.offsetX + dx,
            offsetY: s.viewport.offsetY + dy,
          },
        })),

      zoomAt: (factor, cx, cy) => get().setZoom(get().viewport.scale * factor, cx, cy),

      setZoom: (scale, cx, cy) =>
        set((s) => {
          const next = clampZoom(scale);
          const { offsetX, offsetY, scale: cur } = s.viewport;
          // Keep the world point under (cx, cy) fixed while zooming.
          const worldX = (cx - offsetX) / cur;
          const worldY = (cy - offsetY) / cur;
          return {
            viewport: {
              scale: next,
              offsetX: cx - worldX * next,
              offsetY: cy - worldY * next,
            },
          };
        }),

      resetView: () => set({ viewport: { ...DEFAULT_VIEWPORT } }),
    }),
    {
      name: STORAGE_KEYS.editorPrefs,
      partialize: (s) => ({
        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        fillColor: s.fillColor,
        opacity: s.opacity,
        fontSize: s.fontSize,
        showGrid: s.showGrid,
      }),
    },
  ),
);
