'use strict';

const APP_VERSION = '20260523pwa5';
const CACHE_PREFIX = 'ignight-shell';
const SHELL_CACHE = `${CACHE_PREFIX}-${APP_VERSION}`;
const OFFLINE_URL = './offline.html';
const INDEX_URL = './index.html';

const APP_SHELL_URLS = [
  './',
  INDEX_URL,
  OFFLINE_URL,
  './site.webmanifest?v=20260523pwa5',
  './styles/ignight.css?v=20260523pwa5',
  './scripts/pwa.js?v=20260523pwa5',
  './locales/en.js?v=20260523pwa5',
  './locales/pl.js?v=20260523pwa5',
  './locales/pt-BR.js?v=20260523pwa5',
  './locales/fr.js?v=20260523pwa5',
  './locales/de.js?v=20260523pwa5',
  './locales/content-2026.js?v=20260523pwa5',
  './scripts/card-manifest.js?v=20260523pwa5',
  './scripts/gamification.js?v=20260523pwa5',
  './scripts/sfx.js?v=20260523pwa5',
  './scripts/app.js?v=20260523pwa5',
  './favicon.ico',
  './favicon.svg',
  './favicon-96x96.png',
  './apple-touch-icon.png',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png'
];

const CACHEABLE_EXTENSIONS = /\.(?:css|html|ico|js|json|png|svg|webmanifest)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('.php')) return;
  if (!CACHEABLE_EXTENSIONS.test(url.pathname)) return;

  event.respondWith(cacheFirstWithRefresh(request));
});

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (!response.ok) throw new Error(`navigation-${response.status}`);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(INDEX_URL, response.clone());
    }
    return response;
  } catch (error) {
    if (isIndexNavigation(request)) {
      return (await caches.match(request))
        || (await caches.match(INDEX_URL))
        || (await caches.match(OFFLINE_URL))
        || offlineTextResponse();
    }

    return (await caches.match(OFFLINE_URL)) || offlineTextResponse();
  }
}

async function cacheFirstWithRefresh(request) {
  const cached = await caches.match(request);
  const network = fetch(request).then(async (response) => {
    if (isCacheableResponse(response)) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  });

  if (cached) {
    network.catch(() => {});
    return cached;
  }

  try {
    return await network;
  } catch (error) {
    return new Response('', {
      status: 504,
      statusText: 'Offline'
    });
  }
}

function isCacheableResponse(response) {
  return response && response.ok && response.type === 'basic';
}

function isIndexNavigation(request) {
  const url = new URL(request.url);
  const scopePath = new URL('./', self.location.href).pathname;
  return url.pathname === scopePath || url.pathname === `${scopePath}index.html`;
}

function offlineTextResponse() {
  return new Response('Ignight is offline.', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
