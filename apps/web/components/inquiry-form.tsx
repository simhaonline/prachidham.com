'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Locale, Messages } from '../lib/locales';

type Configuration = { inquiriesEnabled: boolean; policyUrl: string | null };

export function InquiryForm({ itemId, title, locale, messages }: { itemId: string; title: string; locale: Locale; messages: Messages }) {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/v1/catalog/config', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() as Promise<Configuration> : Promise.reject())
      .then((value) => { if (active) setConfig(value); })
      .catch(() => { if (active) setConfig({ inquiriesEnabled: false, policyUrl: null }); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || busy) return;
    setBusy(true); setResult('');
    try {
      const response = await fetch('/api/v1/catalog/inquiries', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, locale, acceptedPolicy: consent, items: [{ id: itemId, quantity }] }),
      });
      if (!response.ok) throw new Error('Request rejected');
      setResult(messages.inquirySuccess);
      setName(''); setEmail(''); setConsent(false);
    } catch { setResult(messages.inquiryError); }
    finally { setBusy(false); }
  }

  return <section className="public-inquiry" aria-label={messages.inquiryContact}>
    <p>{messages.inquiryNotice}</p>
    {!config ? <p aria-live="polite">{messages.loading}</p>
      : !config.inquiriesEnabled || !config.policyUrl
        ? <a className="public-cta public-cta-dark" href={`mailto:Prachidham.ngo@gmail.com?subject=${encodeURIComponent(title)}`}>{messages.inquiryContact} <span aria-hidden="true">↗</span></a>
        : <form onSubmit={submit}>
            <label>{messages.inquiryName}<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>{messages.inquiryEmail}<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>{messages.inquiryQuantity}<input type="number" min={1} max={10} required value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
            <label className="public-consent"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>{messages.inquiryConsent} <a href={config.policyUrl} target="_blank" rel="noopener noreferrer">{messages.privacyPolicy}</a></span></label>
            <button className="public-cta public-cta-dark" type="submit" disabled={busy}>{busy ? messages.loading : messages.inquirySend}</button>
          </form>}
    <p role="status" aria-live="polite">{result}</p>
  </section>;
}
