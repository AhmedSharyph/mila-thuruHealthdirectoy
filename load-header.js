fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
  })
  .catch(err => console.error('Error loading header:', err));


document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const homeLink = document.querySelector('#navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/"], #navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html"]');

  if (homeLink && (currentPath === '/shaviyanihealthdirectory/' || currentPath.endsWith('https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html'))) {
    homeLink.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const homeLink = document.querySelector('#navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/"], #navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html"]');

  if (homeLink && (currentPath === '/shaviyanihealthdirectory/' || currentPath.endsWith('https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html'))) {
    homeLink.style.display = 'none';
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const addContactLink = document.querySelector('#navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/add-contact.html"]');

  if (addContactLink && currentPath.endsWith('https://ahmedsharyph.github.io/shaviyanihealthdirectory/add-contact.html')) {
    addContactLink.style.display = 'none';
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const searchForm = document.getElementById('searchForm');

  if (searchForm && currentPath.endsWith('add-contact.html')) {
    searchForm.style.display = 'none';
  }
});

const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbarNav = document.getElementById('navbarNav');
if (hamburgerBtn && navbarNav) {
  hamburgerBtn.addEventListener('click', () => {
    const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !expanded);
    navbarNav.classList.toggle('hidden');
  });
}
