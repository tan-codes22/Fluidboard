import {
  ArrowUpRight,
  Circle,
  Eraser,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ToolType } from '@/types';
import { TOOLS } from '@/lib/constants';
import { useEditorStore } from '@/store/useEditorStore';
import { IconButton } from '@/components/ui/IconButton';

const ICONS: Record<ToolType, LucideIcon> = {
  select: MousePointer2,
  pen: Pencil,
  rectangle: Square,
  ellipse: Circle,
  line: Minus,
  arrow: ArrowUpRight,
  text: Type,
  eraser: Eraser,
};

export function Toolbar() {
  const tool = useEditorStore((s) => s.tool);
  const setTool = useEditorStore((s) => s.setTool);

  return (
    <div
      role="toolbar"
      aria-label="Drawing tools"
      aria-orientation="horizontal"
      className="panel pointer-events-auto flex max-w-[92vw] items-center gap-1 overflow-x-auto p-1.5"
    >
      {TOOLS.map(({ id, label, shortcut }) => {
        const Icon = ICONS[id];
        return (
          <IconButton
            key={id}
            label={label}
            shortcut={shortcut}
            active={tool === id}
            onClick={() => setTool(id)}
          >
            <Icon size={18} />
          </IconButton>
        );
      })}
    </div>
  );
}
