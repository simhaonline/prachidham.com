'use client';

import { FormEvent, useState } from 'react';
import { MapPinned, Sparkles } from 'lucide-react';
import { getDistance, summarizeNote } from './api';
import { ErrorBanner } from './shared-ui';
import { useStaffMessages } from './staff-locale';

export function IntelligenceTool() {
  const m = useStaffMessages().tools;
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSummary(null);
    setWorking(true);
    try {
      const response = await summarizeNote(title.trim(), text.trim());
      setSummary(response.summary);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : m.intelligenceError);
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="panel tool-panel" aria-labelledby="intelligence-heading">
      <div className="panel-inner">
        <div className="tool-heading"><Sparkles aria-hidden="true" size={20} /><div><p className="eyebrow">{m.intelligenceEyebrow}</p><h2 id="intelligence-heading">{m.intelligenceTitle}</h2></div></div>
        <p className="tool-description">{m.intelligenceBody}</p>
        <p className="privacy-note">{m.intelligencePrivacy}</p>
        <form className="tool-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="field"><label htmlFor="brief-title">{m.noteTitle}</label><input id="brief-title" maxLength={160} onChange={(event) => setTitle(event.target.value)} required value={title} /></div>
          <div className="field"><label htmlFor="brief-text">{m.noteText}</label><textarea id="brief-text" maxLength={4000} onChange={(event) => setText(event.target.value)} required rows={4} value={text} /></div>
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}
          <button className="button button-primary" disabled={working} type="submit">{working ? m.generating : m.generate}</button>
        </form>
        {summary ? <div aria-live="polite" className="tool-result"><span className="detail-label">{m.briefResult}</span><p>{summary}</p></div> : null}
      </div>
    </section>
  );
}

export function GeoDistanceTool() {
  const m = useStaffMessages().tools;
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const fields: Array<[string, string, number, number]> = [
    ['lat1', m.pointALat, -90, 90],
    ['lon1', m.pointALon, -180, 180],
    ['lat2', m.pointBLat, -90, 90],
    ['lon2', m.pointBLon, -180, 180],
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDistance(null);
    setWorking(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await getDistance({
        lat1: Number(form.get('lat1')), lon1: Number(form.get('lon1')),
        lat2: Number(form.get('lat2')), lon2: Number(form.get('lon2')),
      });
      setDistance(result.kilometers);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : m.geoError);
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="panel tool-panel" aria-labelledby="geo-heading">
      <div className="panel-inner">
        <div className="tool-heading"><MapPinned aria-hidden="true" size={20} /><div><p className="eyebrow">{m.geoEyebrow}</p><h2 id="geo-heading">{m.geoTitle}</h2></div></div>
        <p className="tool-description">{m.geoBody}</p>
        <form className="tool-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="coordinate-grid">
            {fields.map(([id, label, min, max]) => (
              <div className="field" key={id}><label htmlFor={id}>{label}</label><input id={id} name={id} type="number" step="any" min={min} max={max} required /></div>
            ))}
          </div>
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}
          <button className="button button-primary" disabled={working} type="submit">{working ? m.calculating : m.calculate}</button>
        </form>
        {distance !== null ? <div aria-live="polite" className="tool-result"><span className="detail-label">{m.distanceResult}</span><p>{distance.toFixed(2)} km</p></div> : null}
      </div>
    </section>
  );
}
