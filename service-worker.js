const CACHE_NAME = "shaviyanihealthdirectory-cache-v6.4";
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
      .then(() => self.skipWaiting())
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
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/shaviyanihealthdirectory/index.html');
        }
      });
    })
  );
});

// -------------------
// Background Sync
// -------------------
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-contacts') {
    event.waitUntil(sendOfflineContacts());
  }
});

// -------------------
// Helper: Send Offline Contacts
// -------------------
async function sendOfflineContacts() {
  const DB_NAME = 'offlineContactsDB';
  const STORE_NAME = 'contacts';
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onsuccess = event => {
      const db = event.target.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getAll = store.getAllKeys();

      getAll.onsuccess = async () => {
        const keys = getAll.result;
        if (!keys.length) return resolve();

        for (let key of keys) {
          const getReq = store.get(key);
          getReq.onsuccess = async () => {
            const contact = getReq.result;
            const formData = new FormData();
            for (let field in contact) formData.append(field, contact[field]);

            try {
              const res = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
              if (res.ok) store.delete(key); // delete by actual key
            } catch (err) {
              console.error('Background sync failed for contact:', contact, err);
            }
          };
        }
        resolve();
      };
      getAll.onerror = () => reject(getAll.error);
    };

    request.onerror = () => reject(request.error);
  });
}
