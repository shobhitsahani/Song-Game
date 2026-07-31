const CACHE_NAME = 'song-game-v2';
const STATIC_CACHE = 'song-game-static-v2';
const DYNAMIC_CACHE = 'song-game-dynamic-v2';
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/create-room',
  '/join-room',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  OFFLINE_URL,
];

const API_PATTERNS = [/\/api\//, /\/socket\.io\//];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
      self.skipWaiting(),
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE
            )
            .map((name) => caches.delete(name))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (API_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|woff2?|ttf|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHES') {
    caches.keys().then((names) =>
      Promise.all(names.map((n) => caches.delete(n)))
    );
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

async function clearOldCaches() {
  const keep = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
  const keys = await caches.keys();
  return Promise.all(
    keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))
  );
}
