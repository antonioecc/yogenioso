const CACHE_NAME = 'yogenioso-v12';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/audio.js',
  './js/levels.js',
  './js/generator.js',
  './manifest.json',
  './icons/icon-512.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalación del Service Worker e inicio de caché.
// El fetch lleva query única + cache:'reload' para saltarse la caché HTTP
// del navegador y la CDN (GitHub Pages, max-age=600): sin esto, addAll
// podía congelar assets VIEJOS en la caché nueva y el fix nunca llegaba.
// Se guarda con la clave SIN query, que es la que espera el resto del SW.
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        fetch(new Request(url + '?sw=' + CACHE_NAME, { cache: 'reload' })).then((res) => {
          if (!res.ok) throw new Error('Precache falló: ' + url);
          return cache.put(url, res);
        })
      ))
    ).then(() => self.skipWaiting())
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

// Estrategia Cache-First con fallback de red.
// ignoreSearch: los recursos se piden con query de versión (ej. app.js?v=7)
// pero se precachean sin ella; sin esta opción la PWA instalada nunca
// acierta en caché y sin conexión carga rota (sin sonidos ni voz).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar recurso cacheado
        return cachedResponse;
      }
      // Si no está en caché, buscar en la red y guardar una copia
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return networkResponse;
      }).catch(() => {
        // Sin red: para navegaciones, servir el index cacheado
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      });
    })
  );
});
