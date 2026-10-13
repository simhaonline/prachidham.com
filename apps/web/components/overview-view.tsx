import { ArrowRight } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, StatusBadge, formatDate } from './shared-ui';
import { IntelligenceTool } from './specialist-tools';
import { useStaffLocale } from './staff-locale';
import type { DashboardData, ModuleDefinition } from './types';

interface OverviewViewProps {
  dashboard: DashboardData | null;
  error: string | null;
  isLoading: boolean;
  modules: ModuleDefinition[];
  onOpenModules: () => void;
  onRetry: () => void;
  canUseAI: boolean;
}

export function OverviewView({ dashboard, error, isLoading, modules, onOpenModules, onRetry, canUseAI }: OverviewViewProps) {
  const { locale, messages: m } = useStaffLocale();
  if (isLoading) return <LoadingState label={m.overview.loading} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!dashboard) return <ErrorState message={m.overview.noResponse} onRetry={onRetry} />;

  const moduleNames = new Map(modules.map((module) => [module.key, module.name]));
  const activeWorkspaces = dashboard.modules.filter((module) => module.count > 0).length;
  const totalWorkspaceDefinitions = modules.length;

  return (
    <>
      <header className="view-header">
        <div>
          <p className="eyebrow">{m.overview.eyebrow}</p>
          <h1>{m.overview.title}</h1>
          <p>{m.overview.body}</p>
        </div>
        <button className="button button-primary" onClick={onOpenModules} type="button">
          {m.overview.browse} <ArrowRight aria-hidden="true" size={17} />
        </button>
      </header>

      <section aria-label={m.overview.totalsLabel} className="summary-grid">
        <article className="summary-card">
          <p className="summary-label">{m.overview.totalRecords}</p>
          <p className="summary-value">{dashboard.totalRecords}</p>
          <p className="summary-caption">{m.overview.totalRecordsCaption}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">{m.overview.activeWorkspaces}</p>
          <p className="summary-value">{activeWorkspaces}</p>
          <p className="summary-caption">{m.overview.activeWorkspacesCaption}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">{m.overview.recentUpdates}</p>
          <p className="summary-value">{dashboard.recent.length}</p>
          <p className="summary-caption">{m.overview.recentUpdatesCaption}</p>
        </article>
      </section>

      <div className="overview-grid">
        <section aria-labelledby="recent-heading" className="panel">
          <div className="panel-inner">
            <div className="section-heading">
              <div>
                <h2 id="recent-heading">{m.overview.recentActivity}</h2>
                <p>{m.overview.recentActivityBody}</p>
              </div>
            </div>
            {dashboard.recent.length === 0 ? (
              <EmptyState title={m.overview.noRecentActivity}>{m.overview.noRecentActivityBody}</EmptyState>
            ) : (
              <ul className="recent-list">
                {dashboard.recent.map((record) => (
                  <li className="recent-item" key={record.id}>
                    <div>
                      <div className="item-kicker">{moduleNames.get(record.moduleKey) ?? record.moduleKey}</div>
                      <div className="item-title">{record.title}</div>
                      <div className="item-date">{m.overview.updated(formatDate(record.updatedAt, locale, m.states.dateUnavailable))}</div>
                    </div>
                    <StatusBadge status={record.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="workspace-activity-heading" className="panel">
          <div className="panel-inner">
            <div className="section-heading">
              <div>
                <h2 id="workspace-activity-heading">{m.overview.workspaceActivity}</h2>
                <p>{totalWorkspaceDefinitions === 0 ? m.overview.noWorkspaceDefinitions : m.overview.workspaceActivityCount(totalWorkspaceDefinitions)}</p>
              </div>
            </div>
            {dashboard.modules.length === 0 ? (
              <EmptyState title={m.overview.noRecords}>{m.overview.noRecordsBody}</EmptyState>
            ) : (
              <ul className="module-count-list">
                {dashboard.modules.map((module) => (
                  <li className="module-count-item" key={module.key}>
                    <span className="module-count-name">{moduleNames.get(module.key) ?? module.key}</span>
                    <span aria-label={m.overview.recordsCount(module.count)} className="module-count-value">{module.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      {canUseAI ? <IntelligenceTool /> : null}
    </>
  );
}
