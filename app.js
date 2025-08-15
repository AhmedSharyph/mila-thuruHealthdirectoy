// ============================
// Global Variables
// ============================
let allRows = [];
let allData = [];
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxI_5lWR-Bvk-FfqFgM2yp_tCgbGcUqxQY1kgPgAMb-7FdpyFTlfp3cvkBNoW2uTou77w/exec";
const container = document.getElementById('directoryContainer');
const DB_NAME = 'offlineContactsDB';
const STORE_NAME = 'contacts';

// ============================
// IndexedDB Helper
// ============================
let db;
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { autoIncrement: true });
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = (e) => reject(e.target.errorCode);
  });
};

// ============================
// Notifications
// ============================
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

// ============================
// Load Data
// ============================
async function loadData() {
  container.innerHTML = `<p class="text-center text-gray-500">Loading data…</p>`;
  try {
    const res = await fetch(WEB_APP_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500">No data found.</p>`;
      return;
    }

    allData = data;
    renderData(data);
    await saveOfflineData(data); // save a copy for offline fallback
  } catch (err) {
    console.error(err);
    showNotification('⚠️ Could not load live data. Using offline cache.', 'error');
    const offlineData = await getOfflineData();
    if (offlineData && offlineData.length) renderData(offlineData);
    else container.innerHTML = `<p class="text-center text-red-500">No data available offline.</p>`;
  }
}

// ============================
// Render Table
// ============================
function renderData(data) {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  const grouped = {};
  data.forEach(item => {
    const center = item['Health Center'] || 'Unknown';
    if (!grouped[center]) grouped[center] = [];
    grouped[center].push(item);
  });

  Object.keys(grouped).sort().forEach(center => {
    const section = document.createElement('section');
    section.className = 'center-group mb-6';
    section.dataset.center = center.toLowerCase();

    const rowsHtml = grouped[center].map(person => {
      const fullName = person['Assigned To'] || '';
      const role = person['Role  or Function'] || '';
      const dept = person['Department'] || '';
      const phone = person['Contact Number'] || '';
      const searchText = `${center} ${fullName} ${role} ${dept} ${phone}`.toLowerCase();

      return `
        <tr class="data-row" data-search="${searchText}">
          <td class="px-4 py-2"><a href="tel:${phone}" class="text-emerald-600">📞 ${phone}</a></td>
          <td class="px-4 py-2">${dept}</td>
          <td class="px-4 py-2">${fullName}</td>
          <td class="px-4 py-2">${role}</td>
        </tr>`;
    }).join('');

    section.innerHTML = `
      <h2 class="text-lg font-semibold mb-2">${center}</h2>
      <div class="overflow-x-auto bg-white rounded shadow">
        <table class="min-w-full border-collapse sortable-table">
          <thead class="bg-[#00bcd4] text-white">
            <tr>
              <th>Phone</th>
              <th>Department</th>
              <th>Assignee</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;

    fragment.appendChild(section);
  });

  container.appendChild(fragment);
  allRows = Array.from(document.querySelectorAll('.data-row'));
}

// ============================
// Filter / Search
// ============================
function filterData(term) {
  term = term.toLowerCase();
  if (!term) {
    allRows.forEach(r => r.style.display = '');
    document.querySelectorAll('section.center-group').forEach(s => s.style.display = '');
    removeNoResultsMessage();
    return;
  }

  let anyVisible = false;

  allRows.forEach(row => {
    const match = row.dataset.search.includes(term);
    row.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });

  document.querySelectorAll('section.center-group').forEach(section => {
    const visibleRows = section.querySelectorAll('tbody tr:not([style*="display: none"])');
    section.style.display = visibleRows.length ? '' : 'none';
  });

  if (!anyVisible) showNoResultsMessage();
  else removeNoResultsMessage();
}

function showNoResultsMessage() {
  if (!document.querySelector('.no-results-message')) {
    const msg = document.createElement('p');
    msg.className = 'no-results-message text-center text-gray-500 mt-4';
    msg.textContent = 'No matching contacts found.';
    container.appendChild(msg);
  }
}

function removeNoResultsMessage() {
  const msg = document.querySelector('.no-results-message');
  if (msg) msg.remove();
}

// ============================
// Offline Storage Helpers
// ============================
async function saveOfflineData(data) {
  if (!db) await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear(); // clear old cache
  data.forEach(item => store.add(item));
}

async function getOfflineData() {
  if (!db) await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

// ============================
// Initialize
// ============================
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', e => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => filterData(e.target.value), 200);
    });
  }
});
