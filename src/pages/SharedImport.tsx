import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { decodeBoard } from '@/lib/share';
import { useBoardStore } from '@/store/useBoardStore';
import { useToast } from '@/store/useToast';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

/**
 * Loads a board shared via link. The board data lives in the URL hash; we
 * decode it, fork a local copy into the user's boards, and open the editor.
 */
export default function SharedImport() {
  const navigate = useNavigate();
  const importBoard = useBoardStore((s) => s.importBoard);
  const notify = useToast((s) => s.notify);
  const [error, setError] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const encoded = window.location.hash.replace(/^#/, '');
    const decoded = encoded ? decodeBoard(encoded) : null;
    if (!decoded) {
      setError(true);
      return;
    }
    const id = importBoard({ name: decoded.name, elements: decoded.elements });
    notify('Shared board added to your boards', 'success');
    navigate(`/board/${id}`, { replace: true });
  }, [importBoard, navigate, notify]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <div>
          <h1 className="text-lg font-semibold">Invalid share link</h1>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            This link is broken or incomplete. Ask the sender for a fresh link.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Spinner label="Opening shared board…" />
    </div>
  );
}
