import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { buildShareUrl } from '@/lib/share';
import { copyToClipboard } from '@/lib/clipboard';
import { useEditorStore } from '@/store/useEditorStore';
import { useToast } from '@/store/useToast';

interface Props {
  open: boolean;
  onClose: () => void;
  boardName: string;
}

export function ShareDialog({ open, onClose, boardName }: Props) {
  const elements = useEditorStore((s) => s.elements);
  const notify = useToast((s) => s.notify);
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => (open ? buildShareUrl({ name: boardName, elements }) : ''),
    [open, boardName, elements],
  );

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    setCopied(ok);
    notify(
      ok ? 'Link copied to clipboard' : 'Could not copy link',
      ok ? 'success' : 'error',
    );
  };

  const tooLong = url.length > 30_000;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this board"
      description="Anyone with the link can open a copy of this board. The board data is encoded in the link itself — nothing is uploaded to a server."
    >
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <Link2 size={16} className="shrink-0 text-slate-400" />
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label="Shareable link"
          className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
        />
        <Button size="sm" variant="primary" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {tooLong && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          This board is large, so the link is very long and may not work everywhere.
          Consider exporting as a file instead.
        </p>
      )}
    </Modal>
  );
}
