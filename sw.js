// Service Worker Name
const CACHE_NAME = 'kas-mit-v3';

// Files to cache
// Gunakan path relatif
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // STRATEGI: NETWORK ONLY (JANGAN CACHE)
  // 1. Request ke Supabase (Database)
  // 2. Request ke Dicebear (Avatar)
  // 3. Request ke Chrome Extension (Environment)
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('dicebear.com') ||
      url.protocol.startsWith('chrome-extension')) {
    return; // Biarkan browser handle network langsung
  }

  // STRATEGI: STALE-WHILE-REVALIDATE (Untuk Aset App)
  // Coba ambil dari cache dulu, tapi tetap update cache di background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache dengan versi terbaru
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
         // Jika offline dan fetch gagal, tidak apa-apa jika sudah ada cachedResponse
      });

      return cachedResponse || fetchPromise;
    })
  );
});