import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Board, BoardSummary, WBElement } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { createId } from '@/lib/id';

interface BoardState {
  boards: Record<string, Board>;
  createBoard: (name?: string) => string;
  importBoard: (data: { name: string; elements: WBElement[] }) => string;
  duplicateBoard: (id: string) => string | null;
  deleteBoard: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
  saveElements: (id: string, elements: WBElement[]) => void;
  getBoard: (id: string) => Board | undefined;
  getSummaries: () => BoardSummary[];
}

function makeBoard(name: string, elements: WBElement[] = []): Board {
  const now = Date.now();
  return {
    id: createId(),
    name: name.trim() || 'Untitled board',
    elements,
    createdAt: now,
    updatedAt: now,
  };
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: {},

      createBoard: (name = 'Untitled board') => {
        const board = makeBoard(name);
        set((s) => ({ boards: { ...s.boards, [board.id]: board } }));
        return board.id;
      },

      importBoard: ({ name, elements }) => {
        const board = makeBoard(name, elements);
        set((s) => ({ boards: { ...s.boards, [board.id]: board } }));
        return board.id;
      },

      duplicateBoard: (id) => {
        const source = get().boards[id];
        if (!source) return null;
        const copy = makeBoard(`${source.name} (copy)`, structuredClone(source.elements));
        set((s) => ({ boards: { ...s.boards, [copy.id]: copy } }));
        return copy.id;
      },

      deleteBoard: (id) =>
        set((s) => {
          const next = { ...s.boards };
          delete next[id];
          return { boards: next };
        }),

      renameBoard: (id, name) =>
        set((s) => {
          const board = s.boards[id];
          if (!board) return s;
          return {
            boards: {
              ...s.boards,
              [id]: {
                ...board,
                name: name.trim() || 'Untitled board',
                updatedAt: Date.now(),
              },
            },
          };
        }),

      saveElements: (id, elements) =>
        set((s) => {
          const board = s.boards[id];
          if (!board) return s;
          return {
            boards: { ...s.boards, [id]: { ...board, elements, updatedAt: Date.now() } },
          };
        }),

      getBoard: (id) => get().boards[id],

      getSummaries: () =>
        Object.values(get().boards)
          .map<BoardSummary>((b) => ({
            id: b.id,
            name: b.name,
            elementCount: b.elements.length,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt),
    }),
    { name: STORAGE_KEYS.boards },
  ),
);
