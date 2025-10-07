// public/sw.js
const CACHE_NAME = 'learning-modules-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/_next/static/chunks/main.js', // Adjust based on your Next.js build output
  '/_next/static/css/app.css', // Adjust based on your Next.js build output
  '/banner-1.jpg', // Add other static assets like images used in your components
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Handle requests for media and static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle media requests (videos, audio, PDFs)
  if (
    url.pathname.startsWith('/api/proxy-video') ||
    url.pathname.includes('.mp4') ||
    url.pathname.includes('.mp3') ||
    url.pathname.includes('.pdf')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          return new Response('Offline and no cached media available', { status: 503 });
        });
      })
    );
  } else {
    // Handle static assets with cache-first strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});