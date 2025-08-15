const scriptURL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
let db;

// 1️⃣ IndexedDB setup
const request = indexedDB.open('offlineContactsDB', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains('contacts')) {
    db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Offline DB ready');
  sendPendingContacts();
};

request.onerror = (event) => {
  console.error('IndexedDB error:', event.target.errorCode);
};

// 2️⃣ Notification utility
function showNotification(message, type = 'success', duration = 4000) {
  const box = document.createElement('div');
  box.className = `
    fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg z-50
    text-white font-semibold text-center
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
  `;
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), duration);
}

// 3️⃣ Offline banner
function showOfflineBanner() {
  if (!document.getElementById('offlineBanner')) {
    const banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center p-2 z-50 font-semibold';
    banner.textContent = '⚠️ You are offline. Contacts will be saved locally.';
    document.body.appendChild(banner);
  }
}

function hideOfflineBanner() {
  const banner = document.getElementById('offlineBanner');
  if (banner) banner.remove();
}

// 4️⃣ Save offline
function saveOffline(contactData) {
  const tx = db.transaction('contacts', 'readwrite');
  tx.objectStore('contacts').add(contactData);
  showNotification('📥 Contact saved locally');
}

// 5️⃣ Send pending contacts
function sendPendingContacts() {
  if (!navigator.onLine || !db) return;

  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');

  const getAll = store.getAll();
  const getKeys = store.getAllKeys();

  getAll.onsuccess = () => {
    const contacts = getAll.result;
    if (!contacts.length) return;

    getKeys.onsuccess = () => {
      const keys = getKeys.result;
      contacts.forEach((contact, i) => {
        const formData = new FormData();
        Object.keys(contact).forEach(k => { if(k !== 'id') formData.append(k, contact[k]); });

        fetch(scriptURL, { method: 'POST', body: formData })
          .then(() => {
            store.delete(keys[i]);
            if (i === contacts.length - 1) showNotification(`✅ ${contacts.length} offline contact(s) synced!`);
          })
          .catch(err => {
            console.error('Failed to sync contact:', err);
            showNotification('⚠️ Some contacts could not be synced', 'error');
          });
      });
    };
  };
}

// 6️⃣ Online/offline events
window.addEventListener('online', () => {
  hideOfflineBanner();
  sendPendingContacts();
});

window.addEventListener('offline', () => {
  showOfflineBanner();
});

// 7️⃣ Hook form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const confirmCheckbox = document.getElementById('confirmDataCheckbox');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Submitting...';

    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((v, k) => dataObj[k] = v);

    if (!navigator.onLine) {
      saveOffline(dataObj);
      form.reset();
      confirmCheckbox.checked = false;
      submitBtn.innerHTML = '✅ Submit';
      return;
    }

    fetch(scriptURL, { method: 'POST', body: formData })
      .then(res => {
        if (!res.ok) throw new Error('Submission failed');
        showNotification('✅ Contact submitted successfully!');
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.innerHTML = '✅ Submit';
        sendPendingContacts();
      })
      .catch(err => {
        console.error(err);
        showNotification('⚠️ Submission failed. Saved offline.', 'error');
        saveOffline(dataObj);
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.innerHTML = '✅ Submit';
      });
  });
});
