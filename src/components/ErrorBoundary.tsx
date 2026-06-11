import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Catches render-time errors so a single bad board can't blank the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In a real deployment this is where an error reporter (e.g. Sentry) hooks in.
    console.error('Unhandled error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              An unexpected error occurred. Your saved boards are safe in local storage.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Back to dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
