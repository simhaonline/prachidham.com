import { ArrowRight, FolderOpen } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from './shared-ui';
import { useStaffMessages } from './staff-locale';
import type { DashboardData, ModuleDefinition } from './types';

interface ModulesViewProps {
  dashboard: DashboardData | null;
  error: string | null;
  isLoading: boolean;
  modules: ModuleDefinition[];
  onOpenModule: (module: ModuleDefinition) => void;
  onRetry: () => void;
}

export function ModulesView({ dashboard, error, isLoading, modules, onOpenModule, onRetry }: ModulesViewProps) {
  const m = useStaffMessages();
  if (isLoading) return <LoadingState label={m.modules.loading} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  const moduleCounts = new Map(dashboard?.modules.map((module) => [module.key, module.count]) ?? []);

  return (
    <>
      <header className="view-header">
        <div>
          <p className="eyebrow">{m.modules.eyebrow}</p>
          <h1>{m.modules.title}</h1>
          <p>{m.modules.body}</p>
        </div>
      </header>
      {modules.length === 0 ? (
        <EmptyState title={m.modules.empty}>{m.modules.emptyBody}</EmptyState>
      ) : (
        <section aria-label={m.modules.title} className="catalog-grid">
          {modules.map((module) => {
            const count = moduleCounts.get(module.key) ?? 0;
            return (
              <article className="module-card" key={module.key}>
                <div className="module-card-group">{module.group || m.modules.groupFallback}</div>
                <h2>{module.name}</h2>
                <p>{module.description || m.modules.descriptionFallback}</p>
                <div className="module-card-footer">
                  <span className="module-card-count">{m.modules.recordCount(count)}</span>
                  <button className="text-button" onClick={() => onOpenModule(module)} type="button">
                    <FolderOpen aria-hidden="true" size={15} /> {m.modules.open} <ArrowRight aria-hidden="true" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
