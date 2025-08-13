const CACHE_NAME = "shaviyanihealthdirectory-cache-v5.6";
const urlsToCache = [
  "/shaviyanihealthdirectory/",
  "/shaviyanihealthdirectory/index.html",
  "/shaviyanihealthdirectory/app.js",
  "/shaviyanihealthdirectory/install.js",
  "/shaviyanihealthdirectory/ft_logo.png",
  "/shaviyanihealthdirectory/manifest.json"
  // Note: No style.css since Tailwind is loaded via CDN
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
});
