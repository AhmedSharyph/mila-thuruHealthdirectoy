const CACHE_NAME = "shaviyanihealthdirectory-cache-v1.3";

// Get base path dynamically so it works even if repo name changes
const basePath = self.registration.scope.replace(self.location.origin, "").replace(/\/$/, "");

const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/app.js`,
  `${basePath}/install.js`,
  `${basePath}/ft_logo.png`,
  `${basePath}/manifest.json`
  // Tailwind CSS is still via CDN, so no style.css here
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell:", urlsToCache);
      return cache.addAll(urlsToCache);
    })
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
