import type { Bounds, Point, WBElement } from '@/types';

/** Shared offscreen context used only for text measurement. */
let measureCtx: CanvasRenderingContext2D | null = null;

export function measureText(
  text: string,
  fontSize: number,
): { width: number; height: number } {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.25;
  if (!measureCtx) {
    // Fallback approximation if a 2D context is unavailable.
    const width = Math.max(...lines.map((l) => l.length)) * fontSize * 0.6;
    return { width, height: lineHeight * lines.length };
  }
  measureCtx.font = `${fontSize}px Inter, system-ui, sans-serif`;
  const width = Math.max(1, ...lines.map((l) => measureCtx!.measureText(l).width));
  return { width, height: lineHeight * lines.length };
}

/** Axis-aligned bounding box for any element, in world coordinates. */
export function getElementBounds(el: WBElement): Bounds {
  switch (el.type) {
    case 'pen': {
      const xs = el.points.map((p) => p.x);
      const ys = el.points.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case 'text': {
      const { width, height } = measureText(el.text || ' ', el.fontSize);
      return { minX: el.x, minY: el.y, maxX: el.x + width, maxY: el.y + height };
    }
    default: {
      return {
        minX: Math.min(el.x1, el.x2),
        minY: Math.min(el.y1, el.y2),
        maxX: Math.max(el.x1, el.x2),
        maxY: Math.max(el.y1, el.y2),
      };
    }
  }
}

/** Combined bounding box of several elements, or null when empty. */
export function getElementsBounds(els: WBElement[]): Bounds | null {
  if (els.length === 0) return null;
  const boxes = els.map(getElementBounds);
  return {
    minX: Math.min(...boxes.map((b) => b.minX)),
    minY: Math.min(...boxes.map((b) => b.minY)),
    maxX: Math.max(...boxes.map((b) => b.maxX)),
    maxY: Math.max(...boxes.map((b) => b.maxY)),
  };
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function pointInBounds(p: Point, b: Bounds, pad = 0): boolean {
  return (
    p.x >= b.minX - pad &&
    p.x <= b.maxX + pad &&
    p.y >= b.minY - pad &&
    p.y <= b.maxY + pad
  );
}

/**
 * Returns true when `point` lies on (or close enough to) an element. The
 * threshold scales with the current zoom so picking thin strokes stays usable.
 */
export function hitTest(el: WBElement, point: Point, threshold = 6): boolean {
  const tol = Math.max(threshold, el.strokeWidth / 2 + 4);
  switch (el.type) {
    case 'pen': {
      for (let i = 0; i < el.points.length - 1; i++) {
        if (distanceToSegment(point, el.points[i], el.points[i + 1]) <= tol) return true;
      }
      return el.points.length === 1
        ? Math.hypot(point.x - el.points[0].x, point.y - el.points[0].y) <= tol
        : false;
    }
    case 'text':
      return pointInBounds(point, getElementBounds(el), tol);
    case 'line':
    case 'arrow':
      return (
        distanceToSegment(point, { x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 }) <= tol
      );
    case 'ellipse': {
      const cx = (el.x1 + el.x2) / 2;
      const cy = (el.y1 + el.y2) / 2;
      const rx = Math.abs(el.x2 - el.x1) / 2;
      const ry = Math.abs(el.y2 - el.y1) / 2;
      if (rx === 0 || ry === 0) return false;
      const norm = (point.x - cx) ** 2 / rx ** 2 + (point.y - cy) ** 2 / ry ** 2;
      if (el.fillColor !== 'transparent') return norm <= 1.1;
      // Outline-only: near the ellipse edge.
      return Math.abs(norm - 1) < 0.35;
    }
    case 'rectangle': {
      const b = getElementBounds(el);
      if (el.fillColor !== 'transparent') return pointInBounds(point, b, tol);
      // Outline-only: near any of the four edges.
      const corners = [
        { x: b.minX, y: b.minY },
        { x: b.maxX, y: b.minY },
        { x: b.maxX, y: b.maxY },
        { x: b.minX, y: b.maxY },
      ];
      for (let i = 0; i < 4; i++) {
        if (distanceToSegment(point, corners[i], corners[(i + 1) % 4]) <= tol)
          return true;
      }
      return false;
    }
  }
}

/** Topmost element under a point, searching from the front of the z-order. */
export function getElementAtPosition(
  point: Point,
  elements: WBElement[],
  threshold = 6,
): WBElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (hitTest(elements[i], point, threshold)) return elements[i];
  }
  return null;
}

/** All elements whose bounding box intersects a rectangular marquee. */
export function getElementsInBox(box: Bounds, elements: WBElement[]): WBElement[] {
  return elements.filter((el) => {
    const b = getElementBounds(el);
    return !(
      b.maxX < box.minX ||
      b.minX > box.maxX ||
      b.maxY < box.minY ||
      b.minY > box.maxY
    );
  });
}

/** Returns a new element translated by (dx, dy). */
export function translateElement(el: WBElement, dx: number, dy: number): WBElement {
  switch (el.type) {
    case 'pen':
      return { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
    case 'text':
      return { ...el, x: el.x + dx, y: el.y + dy };
    default:
      return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
  }
}
