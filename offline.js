// offline.js
const scriptURL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';
let db;

// 1️⃣ Open IndexedDB
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

// 2️⃣ Save contact offline
function saveOffline(contactData) {
  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');
  store.add(contactData);
  alert('You are offline. Contact saved locally and will be submitted when online.');
}

// 3️⃣ Send all pending offline contacts
function sendPendingContacts() {
  if (!navigator.onLine || !db) return;

  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    const allContacts = getAll.result;
    allContacts.forEach((contact, index) => {
      const formData = new FormData();
      for (let key in contact) formData.append(key, contact[key]);

      fetch(scriptURL, { method: 'POST', body: formData })
        .then(() => {
          const deleteTx = db.transaction('contacts', 'readwrite');
          const deleteStore = deleteTx.objectStore('contacts');
          deleteStore.delete(index + 1); // IndexedDB autoIncrement keys start from 1
          console.log('Offline contact submitted:', contact);
        })
        .catch((err) => console.error('Failed to send offline contact:', err));
    });
  };
}

// 4️⃣ Listen for coming back online
window.addEventListener('online', sendPendingContacts);

// 5️⃣ Hook form submission to offline saving
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
        alert('Contact submitted successfully!');
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
        sendPendingContacts(); // Also send any stored offline contacts
      })
      .catch((err) => {
        console.error(err);
        alert('Submission failed. Saving offline.');
        saveOffline(dataObj);
        form.reset();
        confirmCheckbox.checked = false;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
      });
  });
});
