const CACHE_NAME = 'fatigue-cache-v1';
const urlsToCache = [
    './index.html', 
    './style.css', 
    './app.js'
];

self.addEventListener('install', event => {
  // Installs the service worker and pre-caches core assets
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Intercepts network requests and serves from the cache if available (offline first strategy)
  event.respondWith(caches.match(event.request) 
    ? caches.return(event.request) 
    : fetch(event.request));
});

self.addEventListener('activate', event => {
  // Cleans up old caches when a new version is installed (V2 -> V3, etc.)
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
      if (!cacheWhitelist.includes(cacheName)) {
        return caches.delete(cacheName); // Delete old/unused caches
      }
    }));
  }));
});

