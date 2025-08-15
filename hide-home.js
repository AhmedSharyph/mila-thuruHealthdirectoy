<script>
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const homeLink = document.querySelector('#navbarNav a[href="./"], #navbarNav a[href="index.html"]');

  if (homeLink && (currentPath === '/shaviyanihealthdirectory/' || currentPath.endsWith('index.html'))) {
    homeLink.style.display = 'none';
  }
});
</script>
