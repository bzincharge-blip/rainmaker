self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('rainmaker-v1').then((cache) => {
      return cache.addAll([
        './rainmaker_agent_pwa.html',
        './manifest.webmanifest',
        './service-worker.js',
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Network-first for HTML, cache-first for others
  if (url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open('rainmaker-v1').then((cache) => cache.put(event.request, copy));
        return resp;
      }).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request))
    );
  }
});