/* Prachi Dham Foundation public PWA: no private or transactional response caching. */
const CACHE = 'prachi-public-shell-v1';
const ASSETS = new Set(['/offline.html', '/favicon.ico', '/icon-192.png', '/brand/logo.png']);
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...ASSETS])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('prachi-public-shell-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  // Never intercept authenticated routes, API, catalog details, checkout or any URL with query data.
  if (path.startsWith('/staff') || path.startsWith('/api') || path.includes('/catalog/') || path.includes('/checkout') || url.search) return;
  if (ASSETS.has(path)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }
  const publicPage = path === '/' || /^\/[a-z]{2}(?:-[A-Z]{2})?(?:\/(shop|services|contact))?\/?$/.test(path);
  if (request.mode === 'navigate' && publicPage) {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/offline.html')) || Response.error()));
  }
});
