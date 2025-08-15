document.addEventListener('DOMContentLoaded', () => {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxI_5lWR-Bvk-FfqFgM2yp_tCgbGcUqxQY1kgPgAMb-7FdpyFTlfp3cvkBNoW2uTou77w/exec";
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL2KKwec0TU0r-WpsrVoSZykstA1v8Am4fvlQN6J-W8manlp32_JWG0UH41OsbQe3ZAA/exec';

  const healthCenterSelect = document.getElementById('healthCenter');
  const departmentSelect = document.getElementById('department');
  const roleSelect = document.getElementById('role');
  const confirmCheckbox = document.getElementById('confirmDataCheckbox');
  const submitBtn = document.getElementById('submitBtn');
  const form = document.getElementById('contactForm');

  let db;

  // -------------------
  // IndexedDB setup
  // -------------------
  const request = indexedDB.open('offlineContactsDB', 1);
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('contacts')) {
      db.createObjectStore('contacts', { autoIncrement: true });
    }
  };
  request.onsuccess = e => {
    db = e.target.result;
    console.log('Offline DB ready');
    sendPendingContacts();
  };
  request.onerror = e => console.error('IndexedDB error:', e.target.errorCode);

  // -------------------
  // Floating notifications
  // -------------------
  const showNotification = (msg, type = 'success', duration = 4000) => {
    const box = document.createElement('div');
    box.className = `
      fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg z-50
      text-white font-semibold text-center
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
    `;
    box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), duration);
  };

  // -------------------
  // Initialize dropdowns
  // -------------------
  new TomSelect(healthCenterSelect, { create: false, placeholder: "Select a Health Center", maxItems: 1 });

  fetch(WEB_APP_URL + "?action=getDropdownData")
    .then(res => res.json())
    .then(data => {
      const populateSelect = (select, options, placeholder) => {
        select.innerHTML = '';
        const defaultOption = new Option(placeholder, "", true, true);
        defaultOption.disabled = true;
        select.add(defaultOption);
        options.sort().forEach(v => select.add(new Option(v, v)));
        new TomSelect(select, { create: true, placeholder, maxItems: 1 });
      };
      populateSelect(departmentSelect, data.departments, "Select a Department");
      populateSelect(roleSelect, data.roles, "Select a Role or Function");
    })
    .catch(err => console.error(err) && showNotification('Failed to load dropdowns.', 'error'));

  // -------------------
  // Enable submit only if confirmed
  // -------------------
  confirmCheckbox.addEventListener('change', () => {
    submitBtn.disabled = !confirmCheckbox.checked;
  });

  // -------------------
  // Save contact offline
  // -------------------
  const saveOffline = data => {
    if (!db) return;
    const tx = db.transaction('contacts', 'readwrite');
    tx.objectStore('contacts').add(data);
    showNotification('📥 Offline: Contact saved locally.', 'success');

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(reg => reg.sync.register('sync-offline-contacts'));
    }
  };

  // -------------------
  // Send pending contacts
  // -------------------
  const sendPendingContacts = () => {
    if (!navigator.onLine || !db) return;

    const tx = db.transaction('contacts', 'readwrite');
    const store = tx.objectStore('contacts');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
      const contacts = getAll.result;
      if (!contacts.length) return;

      contacts.forEach((contact, i) => {
        const formData = new FormData();
        for (let key in contact) formData.append(key, contact[key]);

        fetch(SCRIPT_URL, { method: 'POST', body: formData })
          .then(res => { if (res.ok) store.delete(i + 1); })
          .catch(err => console.error('Offline sync failed:', err));
      });
    };
  };

  // -------------------
  // Form submit
  // -------------------
  if (form) {
    form.addEventListener('submit', e => {
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
        submitBtn.disabled = true;
        submitBtn.innerHTML = '✅ Submit';
        return;
      }

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
  }

  // -------------------
  // Retry offline contacts when back online
  // -------------------
  window.addEventListener('online', sendPendingContacts);
});
