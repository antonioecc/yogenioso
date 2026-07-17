const CACHE_NAME = 'yogenioso-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/audio.js',
  './js/levels.js',
  './js/generator.js',
  './manifest.json',
  './icons/icon-512.svg'
];

// Instalación del Service Worker e inicio de caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación del Service Worker y limpieza de cachés antiguos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Cache-First con fallback de red
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar recurso cacheado
        return cachedResponse;
      }
      // Si no está en caché, buscar en la red
      return fetch(e.request);
    })
  );
});
