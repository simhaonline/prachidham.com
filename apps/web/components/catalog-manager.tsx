'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ApiError, approveCatalogTranslation, createCatalogItem, getAdminCatalog, getAdminInquiries, getCurrentUser, saveCatalogTranslation, setCatalogPublished, updateCatalogItem, updateInquiryStatus } from './api';
import type { AdminInquiry, CatalogAdminItem, CatalogFormValues } from './commerce-types';
import { adminMessages } from './catalog-admin-messages';
import { languageNames, supportedLocales, type Locale } from '../lib/locales';

export function CatalogManager() {
  const [uiLocale, setUiLocale] = useState<Locale>('en');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [items, setItems] = useState<CatalogAdminItem[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kind, setKind] = useState<'product' | 'service'>('service');
  const [sku, setSku] = useState('');
  const [amount, setAmount] = useState('');
  const [translationLocale, setTranslationLocale] = useState<Locale>('gu');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const m = adminMessages[uiLocale];
  const selected = items.find((item) => item.id === selectedId) || null;
  const translation = selected?.translations.find((entry) => entry.locale === translationLocale);
  const canPublish = selected && selected.translations.filter((entry) => supportedLocales.includes(entry.locale as Locale) && entry.reviewStatus === 'approved').length === supportedLocales.length &&
    (selected.kind !== 'product' || selected.amountPaise !== null);

  const refresh = useCallback(async () => {
    const [catalog, inquiryPage] = await Promise.all([getAdminCatalog(), getAdminInquiries()]);
    setItems(catalog.data); setInquiries(inquiryPage.data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const user = await getCurrentUser();
      if (!['owner', 'admin'].includes(user.role)) { setAuthorized(false); return; }
      setAuthorized(true);
      await refresh();
    } catch (caught) {
      if (caught instanceof ApiError && [401, 403].includes(caught.status)) setAuthorized(false);
      else setError(caught instanceof Error ? caught.message : 'Unable to load catalog.');
    }
    finally { setLoading(false); }
  }, [refresh]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    setTitle(translation?.title || ''); setSlug(translation?.slug || ''); setSummary(translation?.summary || '');
  }, [selectedId, translationLocale, translation?.title, translation?.slug, translation?.summary]);

  function select(item: CatalogAdminItem | null) {
    setSelectedId(item?.id ?? null);
    setKind(item?.kind ?? 'service'); setSku(item?.sku ?? '');
    setAmount(item?.amountPaise === null || item === null ? '' : (item.amountPaise / 100).toFixed(2));
    setNotice(''); setError('');
  }

  async function action(operation: () => Promise<unknown>) {
    setWorking(true); setError(''); setNotice('');
    try { await operation(); await refresh(); setNotice(m.operationSuccess); }
    catch (caught) { setError(caught instanceof Error ? caught.message : m.error); }
    finally { setWorking(false); }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount && !/^\d{1,8}(?:\.\d{1,2})?$/.test(amount)) { setError(m.invalidAmount); return; }
    const values: CatalogFormValues = { kind, sku: kind === 'product' ? sku.trim() : null,
      amountPaise: amount ? Math.round(Number(amount) * 100) : null, currency: 'INR' };
    await action(async () => {
      if (selectedId) await updateCatalogItem(selectedId, values);
      else { const created = await createCatalogItem(values); setSelectedId(created.id); }
    });
  }

  async function saveTranslation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    await action(() => saveCatalogTranslation(selectedId, { locale: translationLocale, title, slug, summary }));
  }

  if (loading) return <main className="catalog-admin" lang={uiLocale}><p role="status">{m.loading}</p></main>;
  return <main className="catalog-admin" lang={uiLocale}>
    <header className="catalog-admin-header">
      <div><a href="/staff">← {m.back}</a><h1>{m.title}</h1><p>{m.intro}</p></div>
      <fieldset className="catalog-language"><legend>{m.language}</legend>{supportedLocales.map((locale) => <button type="button" key={locale} aria-pressed={uiLocale === locale} onClick={() => setUiLocale(locale)}>{languageNames[locale]}</button>)}</fieldset>
    </header>
    {authorized === false ? <p role="alert">{m.denied} <a href="/staff">{m.signIn}</a></p>
      : error && authorized === null ? <p role="alert">{m.error} <button onClick={() => void load()}>{m.retry}</button></p>
      : <div className="catalog-admin-grid">
          <section className="catalog-admin-card" aria-labelledby="catalog-list-title">
            <h2 id="catalog-list-title">{m.listings}</h2>
            <button className="catalog-action" type="button" onClick={() => select(null)}>{m.create}</button>
            {items.length === 0 ? <p>{m.empty}</p> : <ul className="catalog-item-list">{items.map((item) => <li key={item.id}>
              <button type="button" aria-current={selectedId === item.id ? 'true' : undefined} onClick={() => select(item)}>
                <strong>{item.translations.find((t) => t.locale === uiLocale)?.title || item.translations[0]?.title || item.sku || item.kind}</strong>
                <small>{item.kind === 'product' ? m.product : m.service} · {item.publicationStatus}</small>
                <span className="sr-only">{m.select}</span>
              </button>
            </li>)}</ul>}
          </section>
          <div className="catalog-editor-column">
            <section className="catalog-admin-card" aria-labelledby="catalog-edit-title">
              <h2 id="catalog-edit-title">{selected ? m.update : m.create}</h2>
              <form onSubmit={(event) => void saveItem(event)}>
                <label>{m.kind}<select value={kind} onChange={(event) => setKind(event.target.value as 'product' | 'service')}><option value="service">{m.service}</option><option value="product">{m.product}</option></select></label>
                {kind === 'product' && <label>{m.sku}<input value={sku} required maxLength={40} onChange={(event) => setSku(event.target.value)} /></label>}
                <label>{m.amount}<input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
                <button className="catalog-action" type="submit" disabled={working}>{working ? m.busy : selected ? m.update : m.save}</button>
              </form>
            </section>
            {selected && <section className="catalog-admin-card" aria-labelledby="translation-title">
              <h2 id="translation-title">{m.translation}</h2>
              <form onSubmit={(event) => void saveTranslation(event)}>
                <label>{m.language}<select value={translationLocale} onChange={(event) => setTranslationLocale(event.target.value as Locale)}>{supportedLocales.map((locale) => <option key={locale} value={locale}>{languageNames[locale]}</option>)}</select></label>
                <label>{m.titleField}<input value={title} required minLength={2} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
                <label>{m.slug}<input value={slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={80} onChange={(event) => setSlug(event.target.value)} /></label>
                <label>{m.summary}<textarea value={summary} required minLength={10} maxLength={1200} rows={4} onChange={(event) => setSummary(event.target.value)} /></label>
                <button className="catalog-action" type="submit" disabled={working}>{m.saveTranslation}</button>
              </form>
              {translation && <p>{m.status}: {translation.reviewStatus} <button type="button" disabled={working || translation.reviewStatus === 'approved'} onClick={() => void action(() => approveCatalogTranslation(selected.id, translationLocale))}>{m.approveTranslation}</button></p>}
              <p>{m.publicationNote}</p>
              <button className="catalog-action" type="button" disabled={working || (selected.publicationStatus !== 'published' && !canPublish)} onClick={() => void action(() => setCatalogPublished(selected.id, selected.publicationStatus !== 'published'))}>
                {selected.publicationStatus === 'published' ? m.unpublish : m.publish}
              </button>
            </section>}
          </div>
          <section className="catalog-admin-card catalog-inquiries" aria-labelledby="inquiries-title">
            <h2 id="inquiries-title">{m.inquiries}</h2>
            {inquiries.length === 0 ? <p>{m.inquiriesEmpty}</p> : <ul>{inquiries.map((inquiry) => <li key={inquiry.id}>
              <strong>{inquiry.contactName}</strong> · {inquiry.itemCount} {m.items} · {inquiry.status}
              <a href={`mailto:${inquiry.contactEmail}`}>{m.contact}: {inquiry.contactEmail}</a>
              {inquiry.status === 'pending_review' && <button type="button" disabled={working} onClick={() => void action(() => updateInquiryStatus(inquiry.id, 'contacted'))}>{m.markContacted}</button>}
              {inquiry.status !== 'closed' && <button type="button" disabled={working} onClick={() => void action(() => updateInquiryStatus(inquiry.id, 'closed'))}>{m.close}</button>}
            </li>)}</ul>}
          </section>
        </div>}
    {error && authorized !== null && <p role="alert" className="catalog-admin-error">{error}</p>}
    {notice && <p role="status" className="catalog-admin-notice">{notice}</p>}
  </main>;
}
