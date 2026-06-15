const CACHE_NAME = 'gitchat-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/5968/5968756.png'
];

// Установка воркера и кэширование оболочки
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Стратегия: Сначала сеть, если нет — кэш (для работы офлайн)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// ФОНОВАЯ ПРОВЕРКА (Аналог Пушей для Serverless приложений)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-new-messages') {
    event.waitUntil(checkGitHubForNewMessages());
  }
});

// Альтернативный фоновый поток (если браузер не поддерживает PeriodicSync)
setInterval(() => {
  checkGitHubForNewMessages();
}, 15000); // Раз в 15 секунд в фоновом режиме проверки (когда вкладка "спит")

async function checkGitHubForNewMessages() {
  // Получаем сохраненные данные авторизации из кэша/хранилища (через IndexedDB или передачу данных)
  // Для простоты реализации воркер проверяет локальное состояние
  // Если воркер находит новые сообщения в репозитории, он вызывает этот метод:
  
  /* showSystemNotification("Новое сообщение", "Вам кто-то написал в GitChat!");
  */
}

function showSystemNotification(title, body) {
  const options = {
    body: body,
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/5968/5968756.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };
  
  self.registration.showNotification(title, options);
}

// Клик по уведомлению открывает чат
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
