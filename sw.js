// ── Service Worker v11 ─────────────────────────────────────
// NEVER caches index.html — always fetches fresh from network.
// Only caches static assets (icons, fonts, images).
const CACHE = 'family-meals-v11';
const STATIC = ['./icon-192.png','./icon-512.png','./favicon.png','./manifest.json'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url=new URL(e.request.url);

  // Supabase API — always network, never cache
  if(url.hostname.includes('supabase.co')){
    e.respondWith(fetch(e.request));
    return;
  }

  // HTML pages — always network first, no cache fallback
  // This ensures the latest index.html is ALWAYS served
  if(e.request.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).catch(()=>
        new Response('<h1>Offline</h1><p>Please connect to the internet to use Our Family Meals.</p>',
          {headers:{'Content-Type':'text/html'}})
      )
    );
    return;
  }

  // Google Fonts — cache after first load
  if(url.hostname.includes('googleapis.com')||url.hostname.includes('gstatic.com')){
    e.respondWith(
      caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        return r;
      }))
    );
    return;
  }

  // Unsplash background images — cache after first load
  if(url.hostname.includes('unsplash.com')){
    e.respondWith(
      caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        return r;
      })).catch(()=>new Response('',{status:200}))
    );
    return;
  }

  // Static assets (icons etc) — cache first
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});

// Accept skip-waiting message
self.addEventListener('message', e=>{
  if(e.data?.type==='SKIP_WAITING') self.skipWaiting();
});
