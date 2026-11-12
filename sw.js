/* Tiếng Anh bệnh viện 16 bài — chạy offline.
   Trang chính: lấy bản mới từ mạng trước, mất mạng thì dùng bản đã lưu.
   Icon/manifest/font: dùng bản đã lưu. */
const CACHE = "ta16-root-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./icon-maskable-192.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (u.origin !== location.origin) return;
  const isPage = req.mode === "navigate" || /\/(index\.html|manifest\.webmanifest)?$/.test(u.pathname);
  if (isPage) {
    const key = u.pathname.endsWith(".webmanifest") ? "./manifest.webmanifest" : "./index.html";
    e.respondWith(fetch(req, {cache: "no-store"}).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); return res;
    }).catch(() => caches.match(key)));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
});
