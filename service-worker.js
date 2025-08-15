const CACHE_NAME = "shaviyanihealthdirectory-cache-v7.0";
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
// IndexedDB Helper
// -------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("offlineContactsDB", 1);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("contacts")) {
        db.createObjectStore("contacts", { autoIncrement: true });
      }
    };
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

// -------------------
// Save offline contact
// -------------------
async function saveOffline(contact) {
  const db = await openDB();
  const tx = db.transaction("contacts", "readwrite");
  const store = tx.objectStore("contacts");
  store.add(contact);
  return tx.complete;
}

// -------------------
// Background Sync
// -------------------
self.addEventListener("sync", event => {
  if (event.tag === "sync-offline-contacts") {
    event.waitUntil(syncOfflineContacts());
  }
});

async function syncOfflineContacts() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
  const db = await openDB();
  const tx = db.transaction("contacts", "readwrite");
  const store = tx.objectStore("contacts");
  const allContacts = await new Promise(resolve => {
    const getAll = store.getAll();
    getAll.onsuccess = () => resolve(getAll.result);
  });

  for (let i = 0; i < allContacts.length; i++) {
    const contact = allContacts[i];
    const formData = new FormData();
    for (const key in contact) formData.append(key, contact[key]);
    try {
      const res = await fetch(SCRIPT_URL, { method: "POST", body: formData });
      if (res.ok) store.delete(i + 1);
    } catch (err) {
      console.error("Failed to sync contact:", contact, err);
    }
  }

  // Notify all clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: "sync-complete" }));
  });
}

// -------------------
// Receive messages from page (for offline save)
// -------------------
self.addEventListener("message", async event => {
  const { type, contact } = event.data;
  if (type === "save-offline") {
    await saveOffline(contact);
    // Optionally register background sync
    if ("sync" in self.registration) {
      self.registration.sync.register("sync-offline-contacts");
    }
  }
});
