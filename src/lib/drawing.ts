import type { Bounds, WBElement } from '@/types';
import { getElementBounds, getElementsBounds } from './geometry';

export interface Viewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface RenderOptions {
  elements: WBElement[];
  viewport: Viewport;
  /** CSS pixel size of the canvas. */
  width: number;
  height: number;
  dpr: number;
  /** Solid background colour (theme dependent). */
  background: string;
  gridColor: string;
  showGrid?: boolean;
  selectedIds?: Set<string>;
  selectionColor?: string;
  /** A live element being drawn but not yet committed. */
  draft?: WBElement | null;
  /** A live marquee selection rectangle in world coordinates. */
  marquee?: Bounds | null;
}

/** Draws a single element using the current (already transformed) context. */
export function drawElement(ctx: CanvasRenderingContext2D, el: WBElement): void {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  ctx.strokeStyle = el.strokeColor;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (el.type) {
    case 'pen': {
      const pts = el.points;
      if (pts.length === 0) break;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        // A single tap renders as a dot.
        ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const mid = {
            x: (pts[i].x + pts[i + 1].x) / 2,
            y: (pts[i].y + pts[i + 1].y) / 2,
          };
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
      break;
    }
    case 'rectangle': {
      const x = Math.min(el.x1, el.x2);
      const y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1);
      const h = Math.abs(el.y2 - el.y1);
      const r = Math.min(8, w / 2, h / 2);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      if (el.fillColor !== 'transparent') {
        ctx.fillStyle = el.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }
    case 'ellipse': {
      const cx = (el.x1 + el.x2) / 2;
      const cy = (el.y1 + el.y2) / 2;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        Math.abs(el.x2 - el.x1) / 2,
        Math.abs(el.y2 - el.y1) / 2,
        0,
        0,
        Math.PI * 2,
      );
      if (el.fillColor !== 'transparent') {
        ctx.fillStyle = el.fillColor;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(el.x1, el.y1);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      ctx.beginPath();
      ctx.moveTo(el.x1, el.y1);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
      const head = Math.max(12, el.strokeWidth * 3.5);
      ctx.beginPath();
      ctx.moveTo(el.x2, el.y2);
      ctx.lineTo(
        el.x2 - head * Math.cos(angle - Math.PI / 7),
        el.y2 - head * Math.sin(angle - Math.PI / 7),
      );
      ctx.moveTo(el.x2, el.y2);
      ctx.lineTo(
        el.x2 - head * Math.cos(angle + Math.PI / 7),
        el.y2 - head * Math.sin(angle + Math.PI / 7),
      );
      ctx.stroke();
      break;
    }
    case 'text': {
      ctx.fillStyle = el.strokeColor;
      ctx.textBaseline = 'top';
      ctx.font = `${el.fontSize}px Inter, system-ui, sans-serif`;
      const lineHeight = el.fontSize * 1.25;
      el.text.split('\n').forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + i * lineHeight);
      });
      break;
    }
  }
  ctx.restore();
}

function drawGrid(ctx: CanvasRenderingContext2D, opts: RenderOptions): void {
  const { viewport, width, height, gridColor } = opts;
  const spacing = 24;
  const step = spacing * viewport.scale;
  if (step < 6) return; // Too dense to be useful when zoomed far out.
  const startX = viewport.offsetX % step;
  const startY = viewport.offsetY % step;
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x < width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y < height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSelection(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  color: string,
): void {
  const pad = 6;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(
    bounds.minX - pad,
    bounds.minY - pad,
    bounds.maxX - bounds.minX + pad * 2,
    bounds.maxY - bounds.minY + pad * 2,
  );
  ctx.restore();
}

/** Clears and repaints the whole scene. Coordinates are in world space. */
export function renderScene(ctx: CanvasRenderingContext2D, opts: RenderOptions): void {
  const { viewport, width, height, dpr, background } = opts;

  // Reset transform and paint the background in device pixels.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  if (opts.showGrid !== false) drawGrid(ctx, opts);

  // Switch to world space: scale + pan, all on top of the device-pixel ratio.
  ctx.setTransform(
    viewport.scale * dpr,
    0,
    0,
    viewport.scale * dpr,
    viewport.offsetX * dpr,
    viewport.offsetY * dpr,
  );

  for (const el of opts.elements) drawElement(ctx, el);
  if (opts.draft) drawElement(ctx, opts.draft);

  const selColor = opts.selectionColor ?? '#6366f1';
  if (opts.selectedIds && opts.selectedIds.size > 0) {
    const selected = opts.elements.filter((e) => opts.selectedIds!.has(e.id));
    const groupBounds = getElementsBounds(selected);
    if (groupBounds) {
      // Per-element light outline plus a group box for multi-selection.
      for (const el of selected) drawSelection(ctx, getElementBounds(el), selColor);
      if (selected.length > 1) drawSelection(ctx, groupBounds, selColor);
    }
  }

  if (opts.marquee) {
    ctx.save();
    ctx.strokeStyle = selColor;
    ctx.fillStyle = `${selColor}1a`;
    ctx.lineWidth = 1;
    const { minX, minY, maxX, maxY } = opts.marquee;
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  }
}
