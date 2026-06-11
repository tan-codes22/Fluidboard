import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo showWordmark={false} className="scale-150" />
      <div>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">404</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or may have moved.
        </p>
      </div>
      <Button variant="primary" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </div>
  );
}
