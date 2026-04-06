// AURA ∞.Ω — Service Worker (FIX v2 — no cache HTML, update seguro)

var CACHE = 'aura-static-v2';
var ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// 🔧 INSTALL
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(ASSETS).catch(function(){});
    })
  );
  self.skipWaiting();
});

// 🔧 ACTIVATE
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys
          .filter(function(k){ return k !== CACHE; })
          .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// 🔥 FETCH (CLAVE TOTAL)
self.addEventListener('fetch', function(e){

  if (e.request.method !== 'GET') return;

  var url = new URL(e.request.url);

  // ❌ NO CACHEAR APIs
  if (
    url.href.includes('api.anthropic') ||
    url.href.includes('generativelanguage') ||
    url.href.includes('api.groq') ||
    url.href.includes('api.x.ai') ||
    url.href.includes('openrouter') ||
    url.href.includes('allorigins')
  ) return;

  // 🔥 CRÍTICO — HTML SIEMPRE DESDE RED
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 🧠 CACHE SOLO PARA ESTÁTICOS
  e.respondWith(
    caches.match(e.request).then(function(res){
      if (res) return res;

      return fetch(e.request).then(function(networkRes){
        if (
          networkRes &&
          networkRes.status === 200 &&
          e.request.url.startsWith(self.location.origin)
        ) {
          var copy = networkRes.clone();
          caches.open(CACHE).then(function(c){
            c.put(e.request, copy);
          });
        }
        return networkRes;
      });
    })
  );
});
