fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
    const currentPath = window.location.pathname;

    // Hide navbar links pointing to the current page
    document.querySelectorAll('#navbarNav a').forEach(link => {
      let hrefPath;
      try {
        hrefPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
      } catch {
        hrefPath = link.getAttribute('href');
      }

      // Treat both /shaviyanihealthdirectory/ and index.html as homepage
      const isHomeLink = hrefPath === './' || hrefPath.endsWith('index.html');
      const isHomePage = currentPath === '/shaviyanihealthdirectory/' || currentPath.endsWith('index.html');

      if ((isHomeLink && isHomePage) || 
          (hrefPath === 'add-contact.html' && currentPath.endsWith('add-contact.html'))) {
        link.style.display = 'none';
      }
    });

    // Hide search form on add-contact.html
    const searchForm = document.getElementById('searchForm');
    if (searchForm && currentPath.endsWith('add-contact.html')) {
      searchForm.style.display = 'none';
    }

    // Hamburger toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbarNav = document.getElementById('navbarNav');
    if (hamburgerBtn && navbarNav) {
      hamburgerBtn.addEventListener('click', () => {
        const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !expanded);
        navbarNav.classList.toggle('hidden');
      });
    }
  })
  .catch(err => console.error('Error loading header:', err));
