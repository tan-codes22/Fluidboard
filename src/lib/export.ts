import type { WBElement } from '@/types';
import { drawElement } from './drawing';
import { getElementsBounds } from './geometry';

export interface ExportOptions {
  background: string;
  /** Pixel scale multiplier for higher-resolution output. */
  scale?: number;
  padding?: number;
}

/**
 * Renders the given elements onto a fresh canvas sized tightly to their
 * content. Returns null when there is nothing to export.
 */
export function renderElementsToCanvas(
  elements: WBElement[],
  opts: ExportOptions,
): HTMLCanvasElement | null {
  const bounds = getElementsBounds(elements);
  if (!bounds) return null;

  const padding = opts.padding ?? 32;
  const scale = opts.scale ?? 2;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width * scale));
  canvas.height = Math.max(1, Math.ceil(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, width, height);
  ctx.translate(padding - bounds.minX, padding - bounds.minY);

  for (const el of elements) drawElement(ctx, el);
  return canvas;
}

function triggerDownload(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const safeName = (name: string): string =>
  name
    .trim()
    .replace(/[^\w\d-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'fluidboard';

export function exportToPNG(
  elements: WBElement[],
  name: string,
  background: string,
): boolean {
  const canvas = renderElementsToCanvas(elements, { background, scale: 2 });
  if (!canvas) return false;
  triggerDownload(canvas.toDataURL('image/png'), `${safeName(name)}.png`);
  return true;
}

export async function exportToPDF(
  elements: WBElement[],
  name: string,
  background: string,
): Promise<boolean> {
  const canvas = renderElementsToCanvas(elements, { background, scale: 2 });
  if (!canvas) return false;

  // jsPDF is heavy, so it is only loaded when the user actually exports a PDF.
  const { jsPDF } = await import('jspdf');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${safeName(name)}.pdf`);
  return true;
}
