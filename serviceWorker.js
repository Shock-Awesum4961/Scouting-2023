const staticDevScouting2023 = "dev-scouting-2023-v1";
const assets = [
  "/Scouting-2023/",
  "/Scouting-2023/index.html",
  "/Scouting-2023/pages/fragments/nav.html",
  "/Scouting-2023/pages/grid-frag.html",
  "/Scouting-2023/pages/match-scouting.html",
  "/Scouting-2023/pages/pit-scouting.html",
  "/Scouting-2023/pages/saved.html",
  "/Scouting-2023/pages/transfer-receive.html",
  "/Scouting-2023/pages/transfer-send.html",
  "/Scouting-2023/css/style.css",
  "/Scouting-2023/css/bootstrap.min.css",
  "/Scouting-2023/css/bootstrap.min.css.map",
  "/Scouting-2023/css/datatables.min.css.map",
  "/Scouting-2023/js/bootstrap.min.js",
  "/Scouting-2023/js/bootstrap.min.js.map",
  "/Scouting-2023/js/jquery-3.6.3.min.js",
  "/Scouting-2023/js/umd.js",
  "/Scouting-2023/js/qrcode.js",
  "/Scouting-2023/js/html5-qrcode.min.js",
  "/Scouting-2023/js/datatables.min.js",
  "/Scouting-2023/js/app.js",
  "/Scouting-2023/js/database.js",
  "/Scouting-2023/js/match-scouting.js",
  "/Scouting-2023/js/pit-scouting.js",
  "/Scouting-2023/js/saved.js",
  "/Scouting-2023/js/transfer-receive.js",
  "/Scouting-2023/js/transfer-send.js",
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
  console.log(caches)
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
