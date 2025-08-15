// ============================
// Load header and initialize
// ============================
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    // Inject header HTML
    document.getElementById('header-placeholder').innerHTML = html;

    // Initialize header features
    initHeader();

    // Attach search input listener (works after header is loaded)
    const searchInput = document.getElementById('searchInput');
    if (searchInput && typeof filterData === 'function') {
      searchInput.addEventListener('input', filterData);
    }
  })
  .catch(err => console.error('Error loading header:', err));


// ============================
// Initialize header functions
// ============================
function initHeader() {
  hideHomeLink();
  hideAddContactLink();
  hideSearchBar();
  setupMobileMenu();
}

// ============================
// Hide "Home" link on homepage
// ============================
function hideHomeLink() {
  const currentPath = window.location.pathname;
  const homeLink = document.querySelector(
    '#navbarNav a[href$="shaviyanihealthdirectory/"], ' +
    '#navbarNav a[href$="shaviyanihealthdirectory/index.html"]'
  );

  if (homeLink && (currentPath.endsWith('/shaviyanihealthdirectory/') || currentPath.endsWith('/index.html'))) {
    homeLink.style.display = 'none';
  }
}

// ============================
// Hide "Add Contact" link on Add Contact page
// ============================
function hideAddContactLink() {
  const currentPath = window.location.pathname;
  const addLink = document.querySelector('#navbarNav a[href$="add-contact.html"]');

  if (addLink && currentPath.endsWith('add-contact.html')) {
    addLink.style.display = 'none';
  }
}

// ============================
// Hide search bar on Add Contact page
// ============================
function hideSearchBar() {
  const currentPath = window.location.pathname;
  const searchForm = document.getElementById('searchForm');

  if (searchForm && currentPath.endsWith('add-contact.html')) {
    searchForm.style.display = 'none';
  }
}

// ============================
// Mobile menu toggle
// ============================
function setupMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbarNav = document.getElementById('navbarNav');

  if (!hamburgerBtn || !navbarNav) return;

  hamburgerBtn.addEventListener('click', () => {
    const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !expanded);
    navbarNav.classList.toggle('hidden');
  });
}
