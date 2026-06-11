import type { ToolType } from '@/types';

export const STORAGE_KEYS = {
  boards: 'fluidboard:boards:v1',
  theme: 'fluidboard:theme',
  editorPrefs: 'fluidboard:editor-prefs:v1',
} as const;

/** Curated stroke palette shown in the properties panel. */
export const STROKE_COLORS = [
  '#1e1e1e',
  '#e03131',
  '#2f9e44',
  '#1971c2',
  '#f08c00',
  '#9c36b5',
  '#0c8599',
  '#ffffff',
] as const;

export const FILL_COLORS = [
  'transparent',
  '#ffc9c9',
  '#b2f2bb',
  '#a5d8ff',
  '#ffec99',
  '#eebefa',
  '#1e1e1e',
] as const;

export const STROKE_WIDTHS = [2, 4, 8, 14] as const;
export const FONT_SIZES = [16, 24, 36, 56] as const;

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;

/** Canvas background per theme — kept here so export matches what's on screen. */
export const CANVAS_BG = {
  light: '#f8fafc',
  dark: '#0f172a',
} as const;

export const GRID_COLOR = {
  light: 'rgba(15, 23, 42, 0.06)',
  dark: 'rgba(148, 163, 184, 0.10)',
} as const;

export interface ToolMeta {
  id: ToolType;
  label: string;
  shortcut: string;
}

/** Toolbar tools in display order, each with a single-key shortcut. */
export const TOOLS: ToolMeta[] = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'pen', label: 'Draw', shortcut: 'P' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O' },
  { id: 'line', label: 'Line', shortcut: 'L' },
  { id: 'arrow', label: 'Arrow', shortcut: 'A' },
  { id: 'text', label: 'Text', shortcut: 'T' },
  { id: 'eraser', label: 'Eraser', shortcut: 'E' },
];
