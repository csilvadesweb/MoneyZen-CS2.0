const CACHE = "moneyzen-v1";

const FILES = [
  "/MoneyZen-CS2.0/",
  "/MoneyZen-CS2.0/index.html",
  "/MoneyZen-CS2.0/style.css",
  "/MoneyZen-CS2.0/script.js",
  "/MoneyZen-CS2.0/manifest.json",
  "/MoneyZen-CS2.0/privacy.html",
  "/MoneyZen-CS2.0/icons/icon-72.png",
  "/MoneyZen-CS2.0/icons/icon-96.png",
  "/MoneyZen-CS2.0/icons/icon-128.png",
  "/MoneyZen-CS2.0/icons/icon-144.png",
  "/MoneyZen-CS2.0/icons/icon-152.png",
  "/MoneyZen-CS2.0/icons/icon-172.png",
  "/MoneyZen-CS2.0/icons/icon-192.png",
  "/MoneyZen-CS2.0/icons/icon-384.png",
  "/MoneyZen-CS2.0/icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});