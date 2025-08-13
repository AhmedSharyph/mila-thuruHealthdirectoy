const CACHE_NAME = "mila-thuruHealthdirectoy-cache-v1";
const urlsToCache = [
  "/mila-thuruHealthdirectoy/",
  "/mila-thuruHealthdirectoy/index.html",
  "/mila-thuruHealthdirectoy/app.js",
  "/mila-thuruHealthdirectoy/install.js",
  "/mila-thuruHealthdirectoy/ft_logo.png",
  "/mila-thuruHealthdirectoy/manifest.json"
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
