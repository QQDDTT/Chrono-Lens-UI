const CACHE_NAME = 'chrono-lens-v29';
const STATIC_ASSETS = [
  './',
  './index.html',
  './panorama.html',
  './daylight-salon.html',
  './daylight.html',
  './cinema.html',
  './vault.html',
  './studio.html',
  './favicon.svg',
  './manifest.json',
  './assets/soundscape.js',
  './assets/images/logo.svg',
  './assets/artworks/cover-01-panoramic-enamel.svg',
  './assets/artworks/cover-02-daylight-monet.svg',
  './assets/artworks/cover-03-cinema-ripple.svg',
  './assets/artworks/cover-04-vault-seal.svg',
  './assets/artworks/cover-04-vault-seal-dark.svg',
  './assets/artworks/cover-05-avantgarde-pop.svg',
  './assets/artworks/cover-05-avantgarde-pop-dark.svg',
  './assets/artworks/album-05-vintage-patina.svg',
  './data/catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 网络优先策略，保障最新版本即时可见，离线时回退缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
