import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicDir = join(__dirname, '..', 'public');

describe('brand-derived mobile installation', () => {
  it('has a valid manifest and every required icon', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'site.webmanifest'), 'utf8')) as { start_url: string; display: string; icons: Array<{ src: string; sizes: string }> };
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/gu');
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    for (const asset of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'offline.html']) {
      expect(existsSync(join(publicDir, asset)), `${asset} missing`).toBe(true);
    }
  });

  it('keeps authenticated pages, API calls, POST and catalog data out of offline caches', () => {
    const source = readFileSync(join(publicDir, 'sw.js'), 'utf8');
    expect(source).toContain("request.method !== 'GET'");
    expect(source).toMatch(/staff/);
    expect(source).toMatch(/api/);
    expect(source).toMatch(/catalog/);
    expect(source).toContain('/offline.html');
  });
});
