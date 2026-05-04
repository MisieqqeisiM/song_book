const CACHE_NAME = "my-app-cache-v2";

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    fetch("./cache.json")
      .then(res => res.json())
      .then(urls =>
        caches.open(CACHE_NAME).then(cache => cache.addAll(urls))
      )
  );
});

self.addEventListener("activate", event => {
  self.clients.claim();

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() => cached)
      );
    })
  );
});