const CACHE_NAME = 'gitchat-v5'; // Повышаем версию для сброса кэша
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/5968/5968756.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('api.github.com')) return e.respondWith(fetch(e.request));
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
