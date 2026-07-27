// Native Network Intercept Service Worker Definition [cite: 226]
const CACHE_NAME = 'bukopos-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/db.js',
  './js/utils.js',
  './js/sync.js',
  './js/products.js',
  './js/inventory.js',
  './js/sales.js',
  './js/expenses.js',
  './js/reports.js',
  './js/backup.js',
  './js/importExcel.js',
  './js/views.js',
  './js/app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // Pass dynamic background script network calls straight through without caching anomalies
  if (e.request.url.includes('script.google.com')) return;
  
  e.respondWith(
    caches.match(e.request).then(cachedResponse => cachedResponse || fetch(e.request))
  );
});