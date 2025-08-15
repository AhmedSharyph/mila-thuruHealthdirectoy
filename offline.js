const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
const DB_NAME = 'offlineContactsDB';
const STORE_NAME = 'contacts';

// -------------------
// IndexedDB Setup
// -------------------
let db;
const request = indexedDB.open(DB_NAME, 1);

request.onupgradeneeded = event => {
  db = event.target.result;
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true });
  }
};

request.onsuccess = event => {
  db = event.target.result;
  sendPendingContacts(); // try sending on load
};

request.onerror = event => console.error('IndexedDB error:', event.target.errorCode);

// -------------------
// Notification
// -------------------
function showNotification(msg, type='success', duration=4000) {
  const box = document.createElement('div');
  box.className = `
    fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg z-50
    text-white font-semibold text-center
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
  `;
  box.textContent = msg;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), duration);
}

// -------------------
// Save Offline
// -------------------
function saveOffline(contactData) {
  if (!db) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add(contactData);
  showNotification('📥 You are offline. Contact saved locally.', 'success');

  // Register background sync if supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
      sw.sync.register('sync-offline-contacts')
        .then(() => console.log('Background sync registered'))
        .catch(err => console.error('Sync registration failed', err));
    });
  }
}

// -------------------
// Send Pending Contacts
// -------------------
async function sendPendingContacts() {
  if (!navigator.onLine || !db) return;

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    const allContacts = getAll.result;
    if (!allContacts.length) return;

    allContacts.forEach((contact, index) => {
      const formData = new FormData();
      for (let key in contact) formData.append(key, contact[key]);

      fetch(SCRIPT_URL, { method: 'POST', body: formData })
        .then(res => {
          if (res.ok) store.delete(index + 1);
        })
        .catch(err => console.error('Failed to send offline contact:', err));
    });
  };
}

// -------------------
// Listen Online Event
// -------------------
window.addEventListener('online', sendPendingContacts);

// -------------------
// Hook Form Submission
// -------------------
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const confirmCheckbox = document.getElementById('confirmDataCheckbox');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Submitting...';

    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((value, key) => dataObj[key] = value);

    if (!navigator.onLine) {
      saveOffline(dataObj);
      form.reset();
      confirmCheckbox.checked = false;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '✅ Submit';
      return;
    }

    // Online submission
    fetch(SCRIPT_URL, { method: 'POST', body: formData })
      .then(res => {
        if (!res.ok) throw new Error('Submission failed');
        showNotification('✅ Contact submitted successfully!');
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
        sendPendingContacts();
      })
      .catch(err => {
        console.error(err);
        showNotification('⚠️ Submission failed. Saved offline.', 'error');
        saveOffline(dataObj);
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
      });
  });
});
