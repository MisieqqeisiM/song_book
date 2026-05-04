const PRECACHE = 'precache';

self.addEventListener('install', event => {
  event.waitUntil(async function() {
    const response = await fetch("./cache.json");
    const urls = await response.json();
    const cache = await caches.open(PRECACHE);
    await cache.addAll(urls);
    await self.skipWaiting();
  }());
});

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', function(evt) {
  if (!evt.request.url.includes(evt.request.referrer)){
    return;
  }
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(
    update(evt.request)
  );
});

async function fromCache(request) {
  const url = new URL(event.request.url);

  url.search = '';

  const normalizedRequest = new Request(url, {
    method: event.request.method,
    headers: event.request.headers,
    mode: event.request.mode,
    credentials: event.request.credentials,
  });

  const cache = await caches.open(PRECACHE);

  return await cache.match(normalizedRequest);
}

async function update(request) {
  const url = new URL(request.url);
  url.search = '';
  const cache = await caches.open(PRECACHE);
  const response = await fetch(url);
  await cache.put(url.toString(), response.clone());
  return response;
}