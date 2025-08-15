const CACHE_NAME = "shaviyanihealthdirectory-cache-v6.2";
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

// -------------------
// Install Event
// -------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// -------------------
// Activate Event
// -------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// -------------------
// Fetch Event
// -------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Serve cached version if available
      if (cachedResponse) return cachedResponse;

      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Offline fallback for navigations (HTML pages)
        if (event.request.mode === 'navigate') {
          return caches.match('/shaviyanihealthdirectory/index.html');
        }
      });
    })
  );
});
