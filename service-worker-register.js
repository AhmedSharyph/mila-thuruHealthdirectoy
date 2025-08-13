if ('serviceWorker' in navigator) {
  const swPath = `${window.location.pathname.replace(/\/[^\/]*$/, '')}/service-worker.js`;

  navigator.serviceWorker.register(swPath)
    .then(function(registration) {
      showMessage(`✅ Service Worker registered with scope: ${registration.scope}`, 'success');
    })
    .catch(function(error) {
      showMessage(`❌ Service Worker registration failed: ${error}`, 'error');
    });
}

function showMessage(msg, type) {
  const box = document.createElement('div');
  box.className = `
    fixed top-5 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-lg z-50 
    text-white font-semibold
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
  `;
  box.textContent = msg;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}
