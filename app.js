// ============================
// Global variables
// ============================
let allRows = [];        // All table rows for filtering
let allData = [];        // Raw data from Web App URL

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxI_5lWR-Bvk-FfqFgM2yp_tCgbGcUqxQY1kgPgAMb-7FdpyFTlfp3cvkBNoW2uTou77w/exec";
const container = document.getElementById('directoryContainer');

// ============================
// Load data from Google Apps Script
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

    allData = data; // Store raw data for offline filtering
    renderData(data);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-center text-red-500">Failed to load data. Try refreshing.</p>`;
  }
}

// ============================
// Render data in tables
// ============================
function renderData(data) {
  container.innerHTML = "";

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

    container.appendChild(section);
  });

  allRows = Array.from(document.querySelectorAll('.data-row'));
}

// ============================
// Filter / search function
// ============================
function filterData() {
  const term = document.getElementById('searchInput').value.toLowerCase();

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
// Initialize
// ============================
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', filterData);
});
