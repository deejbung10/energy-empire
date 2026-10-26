// keeps Energy Empire playable offline.
// the game: online, it asks the server for the newest build every time (so an update shows up on the next launch);
// offline, it plays the saved one.
// the songs: saved once, then played from the phone. a new or re-cut song changes SONGS_CACHE and the phone fetches
// them again. a song that fails to save is just fetched the next time it plays.
const CACHE = "energy-empire-317d9e31e2";
const SONGS_CACHE = "energy-empire-songs-973aa235f3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-1024.png"];
const SONGS = ["energy-empire-main.mp3", "radio-antler-ale.mp3", "radio-dj-a-fill-01.mp3", "radio-dj-a-fill-02.mp3", "radio-dj-a-fill-03.mp3", "radio-dj-a-fill-04.mp3", "radio-dj-a-fill-05.mp3", "radio-dj-a-fill-06.mp3", "radio-dj-a-fill-07.mp3", "radio-dj-a-fill-08.mp3", "radio-dj-a-fill-09.mp3", "radio-dj-a-fill-10.mp3", "radio-dj-a-fill-11.mp3", "radio-dj-a-fill-12.mp3", "radio-dj-a-fill-13.mp3", "radio-dj-a-fill-14.mp3", "radio-dj-a-fill-15.mp3", "radio-dj-a-fill-16.mp3", "radio-dj-a-fill-17.mp3", "radio-dj-w-fill-01.mp3", "radio-dj-w-fill-02.mp3", "radio-dj-w-fill-03.mp3", "radio-dj-w-fill-04.mp3", "radio-dj-w-fill-05.mp3", "radio-dj-w-fill-06.mp3", "radio-dj-w-fill-07.mp3", "radio-dj-w-fill-08.mp3", "radio-dj-w-fill-09.mp3", "radio-dj-w-fill-10.mp3", "radio-dj-w-fill-11.mp3", "radio-dj-w-fill-12.mp3", "radio-dj-w-fill-13.mp3", "radio-dj-w-fill-14.mp3", "radio-dj-w-fill-15.mp3", "radio-dj-w-huckleberry-in-a.mp3", "radio-dj-w-huckleberry-in-b.mp3", "radio-dj-w-huckleberry-out-a.mp3", "radio-dj-w-huckleberry-out-b.mp3", "radio-dj-w-latte-in-a.mp3", "radio-dj-w-latte-in-b.mp3", "radio-dj-w-latte-out-a.mp3", "radio-dj-w-latte-out-b.mp3", "radio-dj-w-link-1.mp3", "radio-dj-w-link-2.mp3", "radio-dj-w-meteorologist-in-a.mp3", "radio-dj-w-meteorologist-in-b.mp3", "radio-dj-w-meteorologist-out-a.mp3", "radio-dj-w-meteorologist-out-b.mp3", "radio-dj-w-rocketpop-in-a.mp3", "radio-dj-w-rocketpop-in-b.mp3", "radio-dj-w-rocketpop-out-a.mp3", "radio-dj-w-rocketpop-out-b.mp3", "radio-dj-w-tripleberry-in-a.mp3", "radio-dj-w-tripleberry-in-b.mp3", "radio-dj-w-tripleberry-out-a.mp3", "radio-dj-w-tripleberry-out-b.mp3", "radio-gators-aid.mp3", "radio-huckleberry-panquake.mp3", "radio-intro-weather.mp3", "radio-jingle-bung.mp3", "radio-jingle-crunk.mp3", "radio-jingle-judge.mp3", "radio-jingle-nerd.mp3", "radio-jingle-shaa.mp3", "radio-latte-tornado.mp3", "radio-local-zoo-gift-shop.mp3", "radio-magic-carpet-ride.mp3", "radio-meteorologist-mixup.mp3", "radio-platypospine.mp3", "radio-play-sports.mp3", "radio-predator-punch.mp3", "radio-rocket-pop-rainstorm.mp3", "radio-southern-500.mp3", "radio-triple-berry.mp3", "radio-yellow-card.mp3"];
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
