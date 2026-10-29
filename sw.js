// Service worker: simpan salinan aplikasi & pustaka agar bisa dibuka offline.
const CACHE = 'dasbor-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // hanya file aplikasi & pustaka CDN yang di-cache; koneksi Firebase/Google dibiarkan langsung
  if (u.origin !== self.location.origin && !/cdn\.jsdelivr|unpkg|cdnjs|gstatic\.com\/firebasejs|fonts\.g/.test(u.href)) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then((m) => m || caches.match('./index.html'))));
});
