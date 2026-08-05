// sw.js - Service Worker for Client-Side Persistent Image & Banner Caching
const CACHE_NAME = 'nexuspay-image-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

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

// Cache-First Strategy for Offer Banners, Product Cards & Static Images
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  const isImage = 
    request.destination === 'image' || 
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i) ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('cloudinary.com');

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
        });
      })
    );
  }
});
