// keeps Energy Empire playable offline.
// the game: online, it asks the server for the newest build every time (so an update shows up on the next launch);
// offline, it plays the saved one.
// the songs: saved once, then played from the phone. a new or re-cut song changes SONGS_CACHE and the phone fetches
// them again. a song that fails to save is just fetched the next time it plays.
const CACHE = "energy-empire-cded17ff63";
const SONGS_CACHE = "energy-empire-songs-62b1a34d6e";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-1024.png"];
const SONGS = ["radio-intro-weather.mp3"];
const fresh = (url) => fetch(url, { cache: "no-cache", credentials: "same-origin" });
const isSong = (url) => /\.mp3$/.test(new URL(url).pathname);
self.addEventListener("install", (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => fresh(f).then((r) => c.put(f, r))))),
    caches.open(SONGS_CACHE).then((c) => Promise.all(SONGS.map((f) =>
      c.match(f).then((m) => m || fresh(f).then((r) => (r.ok ? c.put(f, r) : null))).catch(() => null)))),
  ]));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== SONGS_CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  if (isSong(e.request.url)) {
    e.respondWith(caches.open(SONGS_CACHE).then((c) => c.match(e.request, { ignoreSearch: true })
      .then((m) => m || fresh(e.request.url).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fresh(e.request.url).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then((m) => m || caches.match("index.html"))));
});
