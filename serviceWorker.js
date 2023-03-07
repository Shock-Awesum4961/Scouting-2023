const staticDevScouting2023 = "dev-scouting-2023-v1";
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/bootstrap.min.css",
  "/css/bootstrap.min.css.map",
  "/js/bootstrap.min.js",
  "/js/bootstrap.min.js.map",
  "/js/jquery-3.6.3.min.js",
  "/js/umd.js",
  "/js/app.js",
  "/js/database.js",
  "images/icons/4961_logo_192.png",
  "images/icons/4961_logo_512.png",
  "images/icons/arrow-counterclockwise.svg",
  "images/icons/pause-fill.svg",
  "images/icons/play-fill.svg",
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevScouting2023).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
