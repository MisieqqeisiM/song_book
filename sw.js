const CACHE_NAME = "my-app-cache-v1";

self.addEventListener("install", event => {
   event.waitUntil(
    fetch("/cache.json")
      .then((res) => res.json())
      .then((urls) => caches.open(CACHE_NAME).then((cache) => cache.addAll(urls)))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});