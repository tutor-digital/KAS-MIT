// Service Worker Name
const CACHE_NAME = 'kas-mit-v4';

// Files to cache
// Kita cache index.html secara eksplisit
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
  const url = new URL(event.request.url);

  // 1. IGNORE EXTERNAL API (Supabase, Dicebear, dll)
  // Biarkan browser handle network langsung (Network Only)
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('dicebear.com') ||
      url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // 2. NAVIGATION REQUEST (Saat user membuka app/refresh halaman)
  // STRATEGI: Cache First, Fallback to Network
  // PENTING: Selalu kembalikan index.html untuk navigasi agar SPA jalan
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((response) => {
        return response || fetch(event.request).catch(() => {
           // Jika offline dan index.html entah kenapa hilang, coba root ./
           return caches.match('./');
        });
      })
    );
    return;
  }

  // 3. ASSET REQUEST (JS, CSS, Images, Manifest)
  // STRATEGI: Stale-While-Revalidate
  // Ambil dari cache dulu biar cepat, lalu update cache di background
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Hanya cache jika sukses
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(() => {
           // Network gagal, tidak apa-apa jika ada cache
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});