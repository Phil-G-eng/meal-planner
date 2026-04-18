// Service Worker v15 — never caches HTML, always fetches fresh
const CACHE = 'fm-v16';
const STATIC = ['./icon-192.png','./icon-512.png','./favicon.png','./manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase — always network
  if (url.hostname.includes('supabase.co')) { e.respondWith(fetch(e.request)); return; }

  // HTML — always network, never cached
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(fetch(e.request, { cache:'no-store' }).catch(() =>
      new Response('<h1>Offline</h1><p>Please reconnect to use Our Family Meals.</p>', { headers:{'Content-Type':'text/html'} })
    )); return;
  }

  // Fonts — cache after first load
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      caches.open(CACHE).then(cache => cache.put(e.request, r.clone())); return r;
    }))); return;
  }

  // Unsplash — cache after first load
  if (url.hostname.includes('unsplash.com')) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      caches.open(CACHE).then(cache => cache.put(e.request, r.clone())); return r;
    }).catch(() => new Response('', {status:200})))); return;
  }

  // Static assets
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});

self.addEventListener('message', e => { if (e.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
