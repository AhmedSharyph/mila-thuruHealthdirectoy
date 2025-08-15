document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/shaviyanihealthdirectory/service-worker.js')
      .then(reg => console.log('✅ Service Worker registered', reg.scope))
      .catch(err => console.error('❌ SW registration failed', err));
  }
});
