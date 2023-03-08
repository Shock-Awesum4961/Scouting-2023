const staticDevScouting2023 = "dev-scouting-2023-v1";
const assets = [
  "/Scouting-2023/",
  "/Scouting-2023/index.html",
  "/Scouting-2023/css/style.css",
  "/Scouting-2023/css/bootstrap.min.css",
  "/Scouting-2023/css/bootstrap.min.css.map",
  "/Scouting-2023/js/bootstrap.min.js",
  "/Scouting-2023/js/bootstrap.min.js.map",
  "/Scouting-2023/js/jquery-3.6.3.min.js",
  "/Scouting-2023/js/umd.js",
  "/Scouting-2023/js/qrcode.min.js",
  "/Scouting-2023/js/html5-qrcode.min.js",
  "/Scouting-2023/js/app.js",
  "/Scouting-2023/js/database.js",
  "/Scouting-2023/images/icons/4961_logo_192.png",
  "/Scouting-2023/images/icons/4961_logo_512.png",
  "/Scouting-2023/images/icons/arrow-counterclockwise.svg",
  "/Scouting-2023/images/icons/pause-fill.svg",
  "/Scouting-2023/images/icons/play-fill.svg",
  "/Scouting-2023/images/icons/icons8-home-page-30.png",
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
