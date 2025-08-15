document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const addContactLink = document.querySelector('#navbarNav a[href="add-contact.html"]');

  if (addContactLink && currentPath.endsWith('add-contact.html')) {
    addContactLink.style.display = 'none';
  }
});
