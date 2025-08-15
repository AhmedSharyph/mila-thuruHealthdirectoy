// 1️⃣ Load header first
fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
    runHeaderScripts(); // Run the rest after header is in place
  })
  .catch(err => console.error('Error loading header:', err));


// 2️⃣ Main initializer after header loads
function runHeaderScripts() {
  hideHomeLink();
  hideAddContactLink();
  hideSearchBar();
  setupMobileMenu();
}


// 3️⃣ Hide "Home" link on homepage
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


// 4️⃣ Hide "Add Contact" link on Add Contact page
function hideAddContactLink() {
  const currentPath = window.location.pathname;
  const addContactLink = document.querySelector('#navbarNav a[href$="add-contact.html"]');
  if (addContactLink && currentPath.endsWith('add-contact.html')) {
    addContactLink.style.display = 'none';
  }
}


// 5️⃣ Hide search bar on Add Contact page
function hideSearchBar() {
  const currentPath = window.location.pathname;
  const searchForm = document.getElementById('searchForm');
  if (searchForm && currentPath.endsWith('add-contact.html')) {
    searchForm.style.display = 'none';
  }
}


// 6️⃣ Mobile menu toggle
function setupMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbarNav = document.getElementById('navbarNav');
  if (hamburgerBtn && navbarNav) {
    hamburgerBtn.addEventListener('click', () => {
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !expanded);
      navbarNav.classList.toggle('hidden');
    });
  }
}
