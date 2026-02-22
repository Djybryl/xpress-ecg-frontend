import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Précache des ressources statiques
precacheAndRoute(self.__WB_MANIFEST);

// Cache des images ECG
registerRoute(
  ({ request }) => request.destination === 'image' && request.url.includes('/ecg-files/'),
  new CacheFirst({
    cacheName: 'ecg-images',
    plugins: [
      {
        // Limite la taille du cache
        cacheWillUpdate: async ({ response }) => {
          if (response && response.status === 200) {
            return response;
          }
          return null;
        }
      }
    ]
  })
);

// Cache des autres ressources
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// Gestion des requêtes API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 3
  })
);

// Écoute des messages pour la synchronisation
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ecgs') {
    event.waitUntil(syncECGs());
  }
});

async function syncECGs() {
  try {
    const cache = await caches.open('ecg-sync-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Error syncing ECG:', error);
      }
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
}

// Notifications push
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  
  if (data) {
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: data.url
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});