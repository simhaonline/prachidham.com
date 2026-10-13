import { AlertCircle, FileQuestion, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useStaffMessages } from './staff-locale';
import type { StaffMessages } from './staff-messages';

export function formatDate(value: string, locale = 'en', unavailable = 'Date unavailable'): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return unavailable;

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusLabel(status: string, messages: StaffMessages): string {
  const key = status.trim().toLowerCase() as keyof StaffMessages['status'];
  return messages.status[key] ?? (status || messages.states.unknown);
}

export function StatusBadge({ status }: { status: string }) {
  const messages = useStaffMessages();
  const normalizedStatus = status.trim().toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-badge status-badge--${normalizedStatus}`}>{statusLabel(status, messages)}</span>;
}

export function LoadingState({ label }: { label?: string }) {
  const messages = useStaffMessages();
  return (
    <section className="state-panel" aria-live="polite" aria-busy="true">
      <LoaderCircle aria-hidden="true" className="loading-mark" size={28} />
      <h2>{messages.states.retrieving}</h2>
      <p>{label ?? messages.states.loadingDefault}</p>
    </section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="state-panel">
      <FileQuestion aria-hidden="true" color="var(--gold)" size={30} />
      <h2>{title}</h2>
      <p>{children}</p>
      {action ? <div style={{ marginTop: 18 }}>{action}</div> : null}
    </section>
  );
}

export function ErrorState({ title, message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  const messages = useStaffMessages();
  return (
    <section className="state-panel state-panel--error" role="alert">
      <AlertCircle aria-hidden="true" size={30} />
      <h2>{title ?? messages.states.errorTitle}</h2>
      <p>{message}</p>
      {onRetry ? (
        <button className="button button-secondary" onClick={onRetry} style={{ marginTop: 18 }} type="button">
          {messages.states.tryAgain}
        </button>
      ) : null}
    </section>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="error-banner" role="alert">
      <AlertCircle aria-hidden="true" size={18} />
      <p>{children}</p>
    </div>
  );
}
