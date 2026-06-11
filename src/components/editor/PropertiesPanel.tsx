import { useMemo } from 'react';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import { FILL_COLORS, FONT_SIZES, STROKE_COLORS, STROKE_WIDTHS } from '@/lib/constants';
import type { StylePrefs } from '@/store/useEditorStore';
import { useEditorStore } from '@/store/useEditorStore';
import { Button } from '@/components/ui/Button';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function Swatch({
  color,
  active,
  onClick,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const transparent = color === 'transparent';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={transparent ? 'No fill' : `Color ${color}`}
      aria-pressed={active}
      className={clsx(
        'h-7 w-7 rounded-lg border transition-transform hover:scale-110',
        active
          ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
          : 'border-slate-300/70 dark:border-slate-600',
      )}
      style={
        transparent
          ? {
              backgroundImage:
                'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%), linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px',
            }
          : { backgroundColor: color }
      }
    />
  );
}

export function PropertiesPanel() {
  const tool = useEditorStore((s) => s.tool);
  const elements = useEditorStore((s) => s.elements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const strokeColor = useEditorStore((s) => s.strokeColor);
  const fillColor = useEditorStore((s) => s.fillColor);
  const strokeWidth = useEditorStore((s) => s.strokeWidth);
  const opacity = useEditorStore((s) => s.opacity);
  const fontSize = useEditorStore((s) => s.fontSize);
  const setStyle = useEditorStore((s) => s.setStyle);
  const applyStyleToSelected = useEditorStore((s) => s.applyStyleToSelected);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);

  const selected = useMemo(
    () => elements.filter((el) => selectedIds.has(el.id)),
    [elements, selectedIds],
  );

  const showFill =
    tool === 'rectangle' ||
    tool === 'ellipse' ||
    selected.some((el) => el.type === 'rectangle' || el.type === 'ellipse');
  const showFont = tool === 'text' || selected.some((el) => el.type === 'text');

  // A style change updates the active tool's defaults and any current selection.
  const update = (patch: Partial<StylePrefs>) => {
    setStyle(patch);
    applyStyleToSelected(patch);
  };

  return (
    <div className="panel pointer-events-auto w-60 space-y-5 p-4">
      {selected.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteSelected}
            className="text-red-600"
          >
            <Trash2 size={15} /> Delete
          </Button>
        </div>
      )}

      <Section label="Stroke">
        <div className="flex flex-wrap items-center gap-1.5">
          {STROKE_COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              active={strokeColor === c}
              onClick={() => update({ strokeColor: c })}
            />
          ))}
          <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-lg border border-slate-300/70 dark:border-slate-600">
            <span
              className="block h-full w-full"
              style={{
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
              }}
            />
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => update({ strokeColor: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom stroke color"
            />
          </label>
        </div>
      </Section>

      {showFill && (
        <Section label="Fill">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILL_COLORS.map((c) => (
              <Swatch
                key={c}
                color={c}
                active={fillColor === c}
                onClick={() => update({ fillColor: c })}
              />
            ))}
          </div>
        </Section>
      )}

      <Section label="Stroke width">
        <div className="flex items-center gap-1.5">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => update({ strokeWidth: w })}
              aria-label={`Stroke width ${w}`}
              aria-pressed={strokeWidth === w}
              className={clsx(
                'flex h-9 flex-1 items-center justify-center rounded-lg border transition-colors',
                strokeWidth === w
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
              )}
            >
              <span
                className="rounded-full bg-slate-700 dark:bg-slate-200"
                style={{ width: 22, height: Math.max(2, w) }}
              />
            </button>
          ))}
        </div>
      </Section>

      {showFont && (
        <Section label="Font size">
          <div className="flex items-center gap-1.5">
            {FONT_SIZES.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => update({ fontSize: f })}
                aria-label={`Font size ${f}`}
                aria-pressed={fontSize === f}
                className={clsx(
                  'flex h-9 flex-1 items-center justify-center rounded-lg border font-semibold transition-colors',
                  fontSize === f
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
                )}
                style={{ fontSize: 12 + i * 3 }}
              >
                A
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section label={`Opacity · ${Math.round(opacity * 100)}%`}>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          aria-label="Opacity"
          className="w-full accent-brand-600"
        />
      </Section>
    </div>
  );
}
