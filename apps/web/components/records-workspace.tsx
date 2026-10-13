'use client';

import { ArrowLeft, Check, ChevronLeft, ChevronRight, ClipboardCheck, FilePlus2, Info, Pencil, Search, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRecord, getRecords, transitionBpmRecord, updateRecord } from './api';
import { EmptyState, ErrorBanner, ErrorState, LoadingState, StatusBadge, formatDate } from './shared-ui';
import { GeoDistanceTool } from './specialist-tools';
import { useStaffLocale } from './staff-locale';
import type { StaffMessages } from './staff-messages';
import type { CurrentUser, ModuleDefinition, RecordData, RecordPage, WorkspaceRecord } from './types';

type EditorState = { mode: 'create' } | { mode: 'edit'; record: WorkspaceRecord } | null;

interface RecordsWorkspaceProps {
  module: ModuleDefinition;
  onBack: () => void;
  onDataChanged: () => void;
  user: CurrentUser;
}

const pageSize = 25;

function actionLabelForModule(module: ModuleDefinition, m: StaffMessages): string {
  const context = `${module.key} ${module.name}`.toLowerCase();
  if (context.includes('crm') || context.includes('constituent')) return m.records.actionNewConstituent;
  if (context.includes('plm') || context.includes('program')) return m.records.actionNewProgram;
  if (context.includes('bpm') || context.includes('approval')) return m.records.actionNewApproval;
  if (context.includes('grant')) return m.records.actionNewGrant;
  if (context.includes('hr') || context.includes('people')) return m.records.actionNewStaff;
  if (context.includes('cdp') || context.includes('profile')) return m.records.actionNewProfile;
  if (context.includes('erp') || context.includes('finance') || context.includes('account')) return m.records.actionNewFinance;
  return m.records.actionNewRecord;
}

function notesFromRecord(data: RecordData): string {
  return typeof data.notes === 'string' ? data.notes : '';
}

function canWriteModule(user: CurrentUser, module: ModuleDefinition): boolean {
  if (user.role === 'viewer') return false;
  const controlledWorkspace = module.key === 'erp' || module.key === 'hrms';
  if (!controlledWorkspace) return true;
  return ['owner', 'admin', 'manager'].includes(user.role);
}

function isBpmModule(module: ModuleDefinition): boolean {
  return module.key.toLowerCase() === 'bpm';
}

export function RecordsWorkspace({ module, onBack, onDataChanged, user }: RecordsWorkspaceProps) {
  const { locale, messages: m } = useStaffLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [records, setRecords] = useState<RecordPage | null>(null);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);

  const canWrite = canWriteModule(user, module);
  const canApprove = ['owner', 'admin', 'manager'].includes(user.role);
  const actionLabel = actionLabelForModule(module, m);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const page = await getRecords(module.key, { limit: pageSize, offset, search });
      setRecords(page);
    } catch (error) {
      setRecords(null);
      setLoadError(error instanceof Error ? error.message : m.records.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [module.key, offset, search, m.records.loadError]);

  useEffect(() => {
    const delay = window.setTimeout(() => {
      void loadRecords();
    }, search ? 250 : 0);

    return () => window.clearTimeout(delay);
  }, [loadRecords, search]);

  useEffect(() => {
    setSearch('');
    setOffset(0);
    setSelectedRecordId(null);
    setActionError(null);
  }, [module.key]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (editor && !dialog.open) dialog.showModal();
    if (!editor && dialog.open) dialog.close();
  }, [editor]);

  const selectedRecord = useMemo(
    () => records?.data.find((record) => record.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;

    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const status = String(form.get('status') ?? 'draft').trim() || 'draft';
    const notes = String(form.get('notes') ?? '').trim();

    if (!title) {
      setActionError(m.records.titleRequired);
      return;
    }

    setActionError(null);
    const existingData = editor.mode === 'edit' ? editor.record.data : {};
    const data: RecordData = { ...existingData, notes };

    try {
      if (editor.mode === 'create') {
        const created = await createRecord(module.key, { title, status, data: notes ? data : undefined });
        setSelectedRecordId(created.id);
      } else {
        const updated = await updateRecord(module.key, editor.record.id, { title, status, data });
        setSelectedRecordId(updated.id);
      }
      setEditor(null);
      await loadRecords();
      onDataChanged();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : m.records.saveError);
    }
  }

  async function handleTransition(status: 'submitted' | 'approved' | 'rejected') {
    if (!selectedRecord) return;
    setActionError(null);
    setIsTransitioning(true);

    try {
      await transitionBpmRecord(selectedRecord.id, status);
      await loadRecords();
      onDataChanged();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : m.records.transitionError);
    } finally {
      setIsTransitioning(false);
    }
  }

  function handleSearchChange(value: string) {
    setOffset(0);
    setSearch(value);
  }

  const showingStart = records && records.pagination.total > 0 ? records.pagination.offset + 1 : 0;
  const showingEnd = records ? Math.min(records.pagination.offset + records.data.length, records.pagination.total) : 0;
  const hasPreviousPage = offset > 0;
  const hasNextPage = records ? offset + records.pagination.limit < records.pagination.total : false;

  return (
    <>
      <header className="view-header">
        <div>
          <p className="eyebrow">{module.group || m.modules.groupFallback}</p>
          <h1>{module.name}</h1>
          <p>{module.description || m.modules.descriptionFallback}</p>
        </div>
        <button className="button button-secondary" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={17} /> {m.records.back}
        </button>
      </header>

      <aside className="workspace-notice" aria-label={m.records.back}>
        <Info aria-hidden="true" size={19} />
        <span><strong>{m.records.noticeLead}</strong> {m.records.noticeBody(module.name)}</span>
      </aside>

      {module.key === 'geo' ? <GeoDistanceTool /> : null}

      {actionError ? <ErrorBanner>{actionError}</ErrorBanner> : null}

      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">{m.records.searchLabel(module.name)}</span>
          <Search aria-hidden="true" size={18} />
          <input onChange={(event) => handleSearchChange(event.target.value)} placeholder={m.records.searchPlaceholder(module.name)} type="search" value={search} />
        </label>
        {canWrite ? (
          <button className="button button-primary" onClick={() => setEditor({ mode: 'create' })} type="button">
            <FilePlus2 aria-hidden="true" size={17} /> {actionLabel}
          </button>
        ) : null}
      </div>

      {!canWrite ? <p className="form-help" style={{ marginBottom: 16 }}>{m.records.readOnly}</p> : null}

      {isLoading ? (
        <LoadingState label={m.records.loading(module.name)} />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadRecords()} />
      ) : !records || records.data.length === 0 ? (
        <EmptyState
          title={search ? m.records.noMatching : m.records.noRecords}
          action={canWrite && !search ? <button className="button button-primary" onClick={() => setEditor({ mode: 'create' })} type="button">{actionLabel}</button> : undefined}
        >
          {search ? m.records.noMatchingBody : m.records.noRecordsBody}
        </EmptyState>
      ) : (
        <div className="records-layout">
          <section aria-label={m.records.searchLabel(module.name)} className="panel records-panel">
            <ul className="record-list">
              {records.data.map((record) => (
                <li className={`record-row${record.id === selectedRecordId ? ' record-row--active' : ''}`} key={record.id}>
                  <button aria-pressed={record.id === selectedRecordId} className="record-select" onClick={() => setSelectedRecordId(record.id)} type="button">
                    <div className="record-title">{record.title}</div>
                    <div className="record-meta">{m.records.updated(formatDate(record.updatedAt, locale, m.states.dateUnavailable))}</div>
                  </button>
                  <div className="record-actions">
                    <StatusBadge status={record.status} />
                    {canWrite && (!isBpmModule(module) || record.status === 'draft') ? (
                      <button aria-label={m.records.editAria(record.title)} className="compact-button" onClick={() => setEditor({ mode: 'edit', record })} type="button">
                        <Pencil aria-hidden="true" size={13} /> {m.records.edit}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="pagination">
              <p>{m.records.showing(showingStart, showingEnd, records.pagination.total)}</p>
              <div className="pagination-actions">
                <button aria-label={m.records.previousPage} className="compact-button" disabled={!hasPreviousPage} onClick={() => setOffset(Math.max(0, offset - pageSize))} type="button"><ChevronLeft aria-hidden="true" size={16} /></button>
                <button aria-label={m.records.nextPage} className="compact-button" disabled={!hasNextPage} onClick={() => setOffset(offset + pageSize)} type="button"><ChevronRight aria-hidden="true" size={16} /></button>
              </div>
            </div>
          </section>

          <aside aria-live="polite" className="panel detail-panel">
            <div className="panel-inner">
              {selectedRecord ? (
                <>
                  <div className="detail-header">
                    <div>
                      <StatusBadge status={selectedRecord.status} />
                      <h2>{selectedRecord.title}</h2>
                    </div>
                    {canWrite && (!isBpmModule(module) || selectedRecord.status === 'draft') ? <button aria-label={m.records.editAria(selectedRecord.title)} className="icon-button" onClick={() => setEditor({ mode: 'edit', record: selectedRecord })} type="button"><Pencil aria-hidden="true" size={18} /></button> : null}
                  </div>
                  <div className="detail-block">
                    <span className="detail-label">{m.records.lastUpdated}</span>
                    <p className="detail-value">{formatDate(selectedRecord.updatedAt, locale, m.states.dateUnavailable)}</p>
                  </div>
                  <div className="detail-block">
                    <span className="detail-label">{m.records.notes}</span>
                    <p className="detail-value">{notesFromRecord(selectedRecord.data) || m.records.noNotes}</p>
                  </div>
                  {isBpmModule(module) ? (
                    <div className="detail-block">
                      <span className="detail-label">{m.records.workflowDecision}</span>
                      {selectedRecord.status.toLowerCase() === 'draft' && canWrite ? (
                        <div className="workflow-actions">
                          <button className="button button-primary" disabled={isTransitioning} onClick={() => void handleTransition('submitted')} type="button"><Check aria-hidden="true" size={16} /> {m.records.submitForApproval}</button>
                        </div>
                      ) : selectedRecord.status.toLowerCase() === 'submitted' && canApprove ? (
                        <div className="workflow-actions">
                          <button className="button button-primary" disabled={isTransitioning} onClick={() => void handleTransition('approved')} type="button"><Check aria-hidden="true" size={16} /> {m.records.approve}</button>
                          <button className="button button-danger" disabled={isTransitioning} onClick={() => void handleTransition('rejected')} type="button"><X aria-hidden="true" size={16} /> {m.records.reject}</button>
                        </div>
                      ) : selectedRecord.status.toLowerCase() === 'submitted' ? (
                        <p className="workflow-help">{m.records.decisionsRestricted}</p>
                      ) : (
                        <p className="workflow-help">{m.records.noFurtherDecision}</p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyState title={m.records.selectRecord}>{m.records.selectRecordBody}</EmptyState>
              )}
            </div>
          </aside>
        </div>
      )}

      <dialog aria-labelledby="record-editor-title" className="dialog" onClose={() => setEditor(null)} ref={dialogRef}>
        {editor ? (
          <form onSubmit={handleSave}>
            <div className="dialog-header">
              <div>
                <p className="eyebrow">{module.name}</p>
                <h2 id="record-editor-title">{editor.mode === 'create' ? actionLabel : m.records.editorUpdate}</h2>
                <p>{m.records.editorScope}</p>
              </div>
              <button aria-label={m.records.closeEditor} className="icon-button" onClick={() => setEditor(null)} type="button"><X aria-hidden="true" size={18} /></button>
            </div>
            {actionError ? <ErrorBanner>{actionError}</ErrorBanner> : null}
            <div className="field">
              <label htmlFor="record-title">{m.records.titleField}</label>
              <input defaultValue={editor.mode === 'edit' ? editor.record.title : ''} id="record-title" name="title" required />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="record-status">{m.records.statusField}</label>
              {isBpmModule(module) ? (
                <>
                  <input id="record-status" name="status" type="hidden" value="draft" />
                  <div className="detail-value"><StatusBadge status="draft" /></div>
                </>
              ) : editor.mode === 'edit' && !['draft', 'active', 'archived'].includes(editor.record.status.toLowerCase()) ? (
                <>
                  <input name="status" type="hidden" value={editor.record.status} />
                  <div className="detail-value"><StatusBadge status={editor.record.status} /></div>
                </>
              ) : (
                <select defaultValue={editor.mode === 'edit' ? editor.record.status : 'active'} id="record-status" name="status">
                  <option value="draft">{m.records.statusDraft}</option>
                  <option value="active">{m.records.statusActive}</option>
                  <option value="archived">{m.records.statusArchived}</option>
                </select>
              )}
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="record-notes">{m.records.notesField} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{m.records.optional}</span></label>
              <textarea defaultValue={editor.mode === 'edit' ? notesFromRecord(editor.record.data) : ''} id="record-notes" name="notes" />
            </div>
            <div className="form-actions">
              <button className="button button-secondary" onClick={() => setEditor(null)} type="button">{m.records.cancel}</button>
              <button className="button button-primary" type="submit"><ClipboardCheck aria-hidden="true" size={17} /> {m.records.save}</button>
            </div>
          </form>
        ) : null}
      </dialog>
    </>
  );
}
