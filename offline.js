// offline.js
const scriptURL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
let db;

// 1️⃣ IndexedDB setup
const request = indexedDB.open('offlineContactsDB', 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains('contacts')) {
    db.createObjectStore('contacts', { autoIncrement: true });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Offline DB ready');
  sendPendingContacts(); // Try sending stored contacts on load
};

request.onerror = (event) => {
  console.error('IndexedDB error:', event.target.errorCode);
};

// 2️⃣ Floating notification function
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

// 3️⃣ Save a contact locally if offline
function saveOffline(contactData) {
  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');
  store.add(contactData);
  showNotification('📥 You are offline. Contact saved locally.', 'success');
}

// 4️⃣ Send all pending contacts
function sendPendingContacts() {
  if (!navigator.onLine || !db) return;

  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    const allContacts = getAll.result;
    if (!allContacts.length) return;

    let sentCount = 0;

    allContacts.forEach((contact, index) => {
      const formData = new FormData();
      for (let key in contact) formData.append(key, contact[key]);

      fetch(scriptURL, { method: 'POST', body: formData })
        .then(() => {
          const deleteTx = db.transaction('contacts', 'readwrite');
          const deleteStore = deleteTx.objectStore('contacts');
          deleteStore.delete(index + 1);

          sentCount++;
          if (sentCount === allContacts.length) {
            showNotification(`✅ ${sentCount} offline contact(s) synced successfully!`);
          }
        })
        .catch((err) => {
          console.error('Failed to send offline contact:', err);
          showNotification('⚠️ Some offline contacts could not be synced.', 'error');
        });
    });
  };
}

// 5️⃣ Listen for online event
window.addEventListener('online', sendPendingContacts);

// 6️⃣ Hook form submission
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
    formData.forEach((value, key) => (dataObj[key] = value));

    if (!navigator.onLine) {
      saveOffline(dataObj);
      form.reset();
      confirmCheckbox.checked = false;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '✅ Submit';
      return;
    }

    // Online submission
    fetch(scriptURL, { method: 'POST', body: formData })
      .then((res) => {
        if (!res.ok) throw new Error('Submission failed');
        showNotification('✅ Contact submitted successfully!');
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
        sendPendingContacts(); // Also send any stored offline contacts
      })
      .catch((err) => {
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
