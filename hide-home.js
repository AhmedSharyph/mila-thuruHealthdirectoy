document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const homeLink = document.querySelector('#navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/"], #navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html"]');

  if (homeLink && (currentPath === '/shaviyanihealthdirectory/' || currentPath.endsWith('https://ahmedsharyph.github.io/shaviyanihealthdirectory/index.html'))) {
    homeLink.style.display = 'none';
  }
});
