let deferredPrompt;

// Fetch app name dynamically from manifest
let appName = 'this app';
fetch('./manifest.json')
  .then(res => res.json())
  .then(manifest => appName = manifest.short_name || manifest.name)
  .catch(() => {});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Create Tailwind-based install prompt
  const box = document.createElement('div');
  box.innerHTML = `
    <div class="fixed bottom-5 left-5 right-5 bg-white p-4 rounded-xl shadow-lg z-50 text-center flex flex-col items-center gap-3">
      <p class="text-base">📲 Add <span class="font-bold">${appName}</span> to your Home Screen</p>
      <button id="installBtn" class="px-6 py-2 bg-teal-400 text-white rounded-lg text-lg font-semibold hover:bg-teal-500 transition">Add</button>
    </div>
  `;
  document.body.appendChild(box);

  document.getElementById('installBtn').addEventListener('click', () => {
    box.remove();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  });
});
