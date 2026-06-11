/**
 * Domain types for the whiteboard.
 *
 * The canvas is modelled as an ordered array of immutable "elements" (an
 * Excalidraw-style scene graph) rather than raw pixels. Re-rendering from this
 * array on every frame is what makes undo/redo, selection, and exporting at any
 * resolution possible.
 */

export type ToolType =
  | 'select'
  | 'pen'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'eraser';

export type ElementType = 'pen' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text';

export interface Point {
  x: number;
  y: number;
}

interface ElementBase {
  id: string;
  type: ElementType;
  strokeColor: string;
  strokeWidth: number;
  opacity: number; // 0..1
}

/** Shapes defined by two corner points (rectangle, ellipse, line, arrow). */
export interface ShapeElement extends ElementBase {
  type: 'rectangle' | 'ellipse' | 'line' | 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fillColor: string; // 'transparent' for none
}

/** Freehand pen / pencil stroke. */
export interface PenElement extends ElementBase {
  type: 'pen';
  points: Point[];
}

/** A text label anchored at its top-left corner. */
export interface TextElement extends ElementBase {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export type WBElement = ShapeElement | PenElement | TextElement;

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** A persisted board document. */
export interface Board {
  id: string;
  name: string;
  elements: WBElement[];
  createdAt: number;
  updatedAt: number;
}

/** Lightweight board info for the dashboard (without full element payloads). */
export interface BoardSummary {
  id: string;
  name: string;
  elementCount: number;
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark';
