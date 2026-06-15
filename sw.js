const CACHE_NAME = 'gitchat-v4'; // Повысили версию для сброса
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

// Запуск фонового интервала внутри Воркера (он не засыпает, как вкладка)
let backgroundTimer = null;
if (!backgroundTimer) {
  backgroundTimer = setInterval(() => {
    checkGitHubBackground();
  }, 30000); // Проверка в фоне каждые 30 секунд
}

async function checkGitHubBackground() {
  // Воркер не имеет доступа к localStorage напрямую, берем данные через IndexedDB или хак с IndexedDB/клиентами
  // Но мы можем запросить последние данные, отправив сообщение открытым вкладкам или сделав скрытый запрос,
  // если закэшировали токены. Чтобы упростить — пока выведем тестовый пуш для проверки жизни воркера:
  
  /* showNotification("Проверка сети", "GitChat проверяет новые сообщения..."); 
  */
}

// Универсальный метод вызова пуша из воркера
function showNotification(title, body) {
  const options = {
    body: body,
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png',
    vibrate: [200, 100, 200],
    data: { focused: true }
  };
  self.registration.showNotification(title, options);
}

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
