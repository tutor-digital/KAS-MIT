// Service Worker Name
const CACHE_NAME = 'kas-mit-v7';

// Files to cache
// Cache root '/' dan index.html
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force update segera
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. IGNORE EXTERNAL API
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('dicebear.com') ||
      url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // 2. NAVIGATION REQUEST (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html')
            .then((response) => {
               if (response) return response;
               // Fallback terakhir ke cache root jika index.html gagal
               return caches.match('/');
            });
        })
    );
    return;
  }

  // 3. ASSET REQUEST (JS, CSS, Images)
  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Network failure, do nothing (will return cachedResponse if available)
      });

      return cachedResponse || fetchPromise;
    })
  );
});