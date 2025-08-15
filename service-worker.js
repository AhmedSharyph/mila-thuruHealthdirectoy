const CACHE_NAME = "shaviyanihealthdirectory-cache-v6.1";
const urlsToCache = [
  "/shaviyanihealthdirectory/",
  "/shaviyanihealthdirectory/index.html",
  "/shaviyanihealthdirectory/add-contact.html",
  "/shaviyanihealthdirectory/header.html",
  "/shaviyanihealthdirectory/app.js",
  "/shaviyanihealthdirectory/add-contact.js",
  "/shaviyanihealthdirectory/load-header.js",
  "/shaviyanihealthdirectory/install.js",
  "/shaviyanihealthdirectory/offline.js",
  "/shaviyanihealthdirectory/ft_logo.png",
  "/shaviyanihealthdirectory/logo.png",
  "/shaviyanihealthdirectory/manifest.json",
  "/shaviyanihealthdirectory/tailwind.js",
  "/shaviyanihealthdirectory/tom-select.js",
  "/shaviyanihealthdirectory/tom-select.css"
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate immediately
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/shaviyanihealthdirectory/index.html');
        }
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});
