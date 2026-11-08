// Service Worker – Bodensee Builder
// Offline-Betrieb: App-Dateien werden beim Installieren zwischengespeichert.
// Strategie "stale-while-revalidate": sofort aus dem Cache, im Hintergrund aktualisieren.
// Eine neue Version ist damit beim nächsten Start aktiv. CACHE bei jedem Release hochzählen.
const CACHE = 'bodensee-builder-v6';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('bodensee-builder-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const nav = req.mode === 'navigate';
  const key = nav ? 'index.html' : req;   // Navigation (auch mit #debug oder ?…) auf die Startseite abbilden
  const fresh = fetch(req).then(async res => {
    if (res && res.ok && res.type === 'basic') {
      const copy = res.clone();
      await (await caches.open(CACHE)).put(key, copy);
    }
    return res;
  }).catch(() => null);
  e.waitUntil(fresh);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key, { ignoreSearch: nav });
    if (cached) return cached;
    const res = await fresh;
    return res || (nav && await cache.match('index.html')) || Response.error();
  })());
});
