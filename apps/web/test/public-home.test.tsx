import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicHome } from '../components/public-home';
import { getMessages } from '../lib/locales';
import StaffPage from '../app/staff/page';

describe('public homepage', () => {
  it('renders a public introduction and a staff link without requiring a session', () => {
    const html = renderToStaticMarkup(<PublicHome locale="gu" messages={getMessages('gu')} />);
    expect(html).toContain('<h1');
    expect(html).toContain('Prachi Dham Foundation');
    expect(html).toContain('Gir Somnath');
    expect(html).toContain('href="/staff"');
    expect(html).toContain('href="/gu/shop"');
    expect(html).not.toContain('Checking your secure staff session');
    expect(html).not.toContain('Sign in with the account created');
  });

  it('retains the session-aware staff portal on its own route', () => {
    const html = renderToStaticMarkup(<StaffPage />);
    expect(html).toContain('Checking your secure staff session');
    expect(html).not.toContain('A place to begin.');
  });
});
