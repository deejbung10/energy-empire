// keeps Energy Empire playable offline. online, it asks the server for the newest build every time
// (never the browser's short-term copy, so an update shows up on the next launch); offline, it plays the saved one.
const CACHE = "energy-empire-dd14138475";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-1024.png"];
const fresh = (url) => fetch(url, { cache: "no-cache", credentials: "same-origin" });
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => fresh(f).then((r) => c.put(f, r)))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fresh(e.request.url).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then((m) => m || caches.match("index.html"))));
});
