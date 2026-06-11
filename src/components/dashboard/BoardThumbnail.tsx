import { useEffect, useRef } from 'react';
import type { WBElement } from '@/types';
import { drawElement } from '@/lib/drawing';
import { getElementsBounds } from '@/lib/geometry';
import { useThemeStore } from '@/store/useThemeStore';
import { CANVAS_BG } from '@/lib/constants';

interface BoardThumbnailProps {
  elements: WBElement[];
}

const W = 320;
const H = 180;

/** Renders a scaled-to-fit, non-interactive preview of a board's contents. */
export function BoardThumbnail({ elements }: BoardThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = CANVAS_BG[theme];
    ctx.fillRect(0, 0, W, H);

    const bounds = getElementsBounds(elements);
    if (!bounds) return;

    const pad = 16;
    const contentW = bounds.maxX - bounds.minX || 1;
    const contentH = bounds.maxY - bounds.minY || 1;
    const scale = Math.min((W - pad * 2) / contentW, (H - pad * 2) / contentH, 1);
    const offsetX = (W - contentW * scale) / 2 - bounds.minX * scale;
    const offsetY = (H - contentH * scale) / 2 - bounds.minY * scale;

    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
    for (const el of elements) drawElement(ctx, el);
  }, [elements, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ aspectRatio: `${W} / ${H}` }}
      aria-hidden="true"
    />
  );
}
