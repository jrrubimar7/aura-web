// AURA ∞.Ω — Service Worker (rebuild-safe v3)
// Objetivo: evitar HTML viejo, limpiar caches previas y cachear solo estáticos seguros.

var CACHE = 'aura-static-v3';
var STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// INSTALL
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(STATIC_ASSETS).catch(function () {});
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// MENSAJES
self.addEventListener('message', function (event) {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
          return caches.delete(key);
        }));
      })
    );
  }
});

// FETCH
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);
  var isSameOrigin = url.origin === self.location.origin;
  var isHTML = event.request.mode === 'navigate' ||
               (event.request.headers.get('accept') || '').includes('text/html') ||
               url.pathname.endsWith('.html');

  // Nunca cachear APIs externas
  if (
    url.href.includes('api.anthropic.com') ||
    url.href.includes('generativelanguage.googleapis.com') ||
    url.href.includes('api.groq.com') ||
    url.href.includes('api.x.ai') ||
    url.href.includes('openrouter.ai') ||
    url.href.includes('allorigins')
  ) {
    return;
  }

  // Nunca cachear HTML: siempre red
  if (isHTML) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function () {
        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><title>AURA offline</title></head><body style="font-family:sans-serif;padding:20px;background:#f8f9fb;color:#111827;">AURA no pudo cargar esta página sin conexión.</body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // Solo cachear estáticos seguros del mismo origen
  var isStatic =
    isSameOrigin &&
    (
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.ttf') ||
      url.pathname.endsWith('.json')
    );

  if (!isStatic) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;

      return fetch(event.request).then(function (networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type !== 'opaque'
        ) {
          var copy = networkResponse.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return networkResponse;
      });
    })
  );
});
