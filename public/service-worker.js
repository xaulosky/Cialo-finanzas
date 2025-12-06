const CACHE_NAME = 'cialo-finanzas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/css/styles.css',
  '/src/js/app.js',
  '/src/js/config.js',
  '/src/js/modules/auth.js',
  '/src/js/modules/gastos.js',
  '/src/js/modules/sueldos.js',
  '/src/js/modules/proveedores.js',
  '/src/js/modules/ganancias.js',
  '/src/js/modules/dashboard.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia de cache: Network First, fallback a Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, clónala y guárdala en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intenta obtener del cache
        return caches.match(event.request);
      })
  );
});
