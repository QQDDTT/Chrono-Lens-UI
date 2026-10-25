const CACHE_NAME = 'chrono-lens-v26';
const STATIC_ASSETS = [
  './',
  './index.html',
  './daylight-salon.html',
  './daylight.html',
  './panorama.html',
  './favicon.svg',
  './manifest.json',
  './assets/images/logo.svg',
  './assets/images/panorama-module-cover.jpg',
  './assets/images/magic-box-cover.jpg',
  './data/media/pano_cosmos_living_scene_4k.jpg',
  './data/media/pano_cosmos_street_walk_4k.jpg',
  './data/media/pano_cosmos_classic_epoch_4k.jpg',
  './data/media/pano_manifest.json',
  './assets/css/style.css',
  './assets/js/app.js',
  './data/catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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
