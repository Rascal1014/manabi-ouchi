// ファイルを更新したら CACHE の番号を上げる
const CACHE = "manabi-ouchi-v24";

const FILES = [
  "./",
  "index.html",
  "manifest.json",
  "css/style.css",
  "js/storage.js",
  "js/util.js",
  "js/score.js",
  "js/quiz.js",
  "js/shop.js",
  "js/house.js",
  "js/dressup.js",
  "js/main.js",
  "data/characters.js",
  "data/shop.js",
  "data/packs/index.js",
  "data/packs/jutsugo.js",
  "img/icon-192.png",
  "img/title.webp",
  "img/rooms/oneroom.webp",
  ...["haro", "ribbon", "pom"].flatMap((id) =>
    ["normal", "happy", "cry", "walkf1", "walkf2", "walkf3", "walkb1", "walkb2", "walkb3"].map(
      (m) => `img/characters/${id}_${m}.webp`
    )
  ),
  // ほかの画像（家・こもの・服を着た絵・ご褒美など）は 先には入れず、使ったときに 保存する
];

self.addEventListener("install", (e) => {
  // ブラウザに のこっている 古いファイルを つかわないように、サーバーから とりなおす
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// ネットにつながっていれば最新を使い、つながらなければ保存したものを使う
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    // GitHub Pages は 10分 ブラウザに 古いものを のこすので、毎回 新しいか たしかめてから つかう
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
