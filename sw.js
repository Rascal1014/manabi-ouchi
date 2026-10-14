// ファイルを更新したら CACHE の番号を上げる
const CACHE = "manabi-ouchi-v12";

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
  "img/title.jpg",
  ...["oneroom", "house1", "house2_1f", "house2_2f", "garden", "pool"].map((n) => `img/rooms/${n}.jpg`),
  ...["oneroom", "house1", "house2", "garden", "pool"].map((n) => `img/houses/${n}.png`),
  ...["haro", "ribbon", "pom"].flatMap((id) =>
    ["normal", "happy", "cry", "walkf1", "walkf2", "walkf3", "walkb1", "walkb2", "walkb3"].map(
      (m) => `img/characters/${id}_${m}.png`
    )
  ),
  ...[
    "tshirt", "blouse", "vest", "dress", "swim", "coat", "dogi", "kimono",
    "ribbon", "flowerhair", "cap", "strawhat", "tophat", "gradcap", "crown",
    "pouch", "basket", "handbag", "backpack", "briefcase",
    "nurse", "police", "princess", "heroine", "robot",
    "nursecap", "policecap", "tiara", "heroinebow", "robothead",
  ].map((n) => `img/items/${n}.png`),
  // 服を着た絵（img/dressed/）は 数が多いので 先には入れず、使ったときに 保存する
  ...["nursecap", "policecap", "heroinebow", "ribbon", "cap", "strawhat", "tophat", "gradcap"].map(
    (n) => `img/items/${n}_back.png`
  ),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `img/special/sp${n}.jpg`),
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
