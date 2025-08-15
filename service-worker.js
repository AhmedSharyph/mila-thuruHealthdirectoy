const CACHE_NAME = "shaviyanihealthdirectory-cache-v6.3";
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

const OFFLINE_DB_NAME = "offlineContactsDB";
const OFFLINE_STORE = "contacts";
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';

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
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// -------------------
// Fetch Event (Cache-first, fallback to network)
// -------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
      .catch(() => {
        // Offline fallback for navigations
        if (event.request.mode === 'navigate') {
          return caches.match('/shaviyanihealthdirectory/index.html');
        }
      })
  );
});

// -------------------
// IndexedDB Helper
// -------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, 1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        db.createObjectStore(OFFLINE_STORE, { autoIncrement: true });
      }
    };
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

// -------------------
// Save contact offline
// -------------------
async function saveOffline(contactData) {
  const db = await openDB();
  const tx = db.transaction(OFFLINE_STORE, 'readwrite');
  tx.objectStore(OFFLINE_STORE).add(contactData);
}

// -------------------
// Send pending offline contacts
// -------------------
async function sendPendingContacts() {
  if (!navigator.onLine) return;
  const db = await openDB();
  const tx = db.transaction(OFFLINE_STORE, 'readwrite');
  const store = tx.objectStore(OFFLINE_STORE);
  const getAll = store.getAll();

  getAll.onsuccess = async () => {
    const contacts = getAll.result;
    if (!contacts.length) return;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const formData = new FormData();
      for (let key in contact) formData.append(key, contact[key]);

      try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        if (res.ok) store.delete(i + 1);
      } catch (err) {
        console.error('Failed to send offline contact:', err);
      }
    }
  };
}

// -------------------
// Listen for online event
// -------------------
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-contacts') {
    event.waitUntil(sendPendingContacts());
  }
});
