document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const addContactLink = document.querySelector('#navbarNav a[href="https://ahmedsharyph.github.io/shaviyanihealthdirectory/add-contact.html"]');

  if (addContactLink && currentPath.endsWith('https://ahmedsharyph.github.io/shaviyanihealthdirectory/add-contact.html')) {
    addContactLink.style.display = 'none';
  }
});
