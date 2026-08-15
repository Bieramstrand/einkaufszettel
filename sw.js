const CACHE_NAME = 'einkaufszettel-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// App Hülle: zuerst aus dem Zwischenspeicher, im Hintergrund aktualisieren
// Fremde Inhalte (z. B. Schriften): Netz zuerst, sonst Zwischenspeicher
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isOwnOrigin = url.origin === self.location.origin;

  if(isOwnOrigin){
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }else{
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
