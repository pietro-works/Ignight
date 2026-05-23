(() => {
  'use strict';

  const version = '20260523pwa5';

  window.IgnightPWA = { version };

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {
      scope: './',
      updateViaCache: 'none'
    }).then((registration) => {
      registration.update().catch(() => {});
    }).catch(() => {});
  });
})();
