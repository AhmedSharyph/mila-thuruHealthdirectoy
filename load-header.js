// load-header.js

// Load header dynamically
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    const placeholder = document.getElementById('header-placeholder');
    placeholder.innerHTML = data;

    const currentPath = window.location.pathname;

    // Hide navbar links pointing to current page
    const navbarLinks = document.querySelectorAll('#navbarNav a');
    navbarLinks.forEach(link => {
      let hrefPath;
      try {
        hrefPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
      } catch {
        hrefPath = link.getAttribute('href');
      }
      if (hrefPath === currentPath || (hrefPath.endsWith('index.html') && currentPath.endsWith('index.html'))) {
        link.style.display = 'none';
      }
    });

    // Hide search form on add-contact.html
    const searchForm = document.getElementById('searchForm');
    const pagesToHideSearch = ['/shaviyanihealthdirectory/add-contact.html'];
    if (searchForm && pagesToHideSearch.includes(currentPath)) {
      searchForm.style.display = 'none';
    }
  })
  .catch(err => console.error('Error loading header:', err));
