export function getSiteOrigin(value: string | undefined): string | undefined {
  if (value === undefined || value === '') return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('PUBLIC_SITE_ORIGIN must be a valid HTTPS origin.');
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password || value.trim() !== value) {
    throw new Error('PUBLIC_SITE_ORIGIN must be a clean HTTPS origin without a path, credentials, query or fragment.');
  }
  return url.origin;
}

export function isSiteIndexable(origin: string | undefined, value: string | undefined): boolean {
  return Boolean(origin) && value === 'true';
}
