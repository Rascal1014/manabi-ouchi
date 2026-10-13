// 家のタイプ。上から順にグレードアップする。
// image: ショップに出す外観 / rooms: おうち画面で切りかえられる場所と、その背景 / maxItems: 置ける家具の数
const HOUSES = [
  {
    id: "oneroom", name: "ワンルーム", price: 0, maxItems: 6,
    image: "img/houses/oneroom.png",
    rooms: { "1f": "img/rooms/oneroom.jpg" },
  },
  {
    id: "house1", name: "1かいだて", price: 500, maxItems: 10,
    image: "img/houses/house1.png",
    rooms: { "1f": "img/rooms/house1.jpg" },
  },
  {
    id: "house2", name: "2かいだて", price: 1500, maxItems: 18,
    image: "img/houses/house2.png",
    rooms: { "1f": "img/rooms/house2_1f.jpg", "2f": "img/rooms/house2_2f.jpg" },
  },
  {
    id: "garden", name: "にわつき", price: 3000, maxItems: 26,
    image: "img/houses/garden.png",
    rooms: { "1f": "img/rooms/house2_1f.jpg", "2f": "img/rooms/house2_2f.jpg", garden: "img/rooms/garden.jpg" },
  },
  {
    id: "pool", name: "プールつき", price: 6000, maxItems: 34,
    image: "img/houses/pool.png",
    rooms: { "1f": "img/rooms/house2_1f.jpg", "2f": "img/rooms/house2_2f.jpg", garden: "img/rooms/pool.jpg" },
  },
];

const AREA_NAMES = { "1f": "1かい", "2f": "2かい", garden: "にわ" };

// 背景ごとの、キャラが歩ける床の範囲（足もとの位置。部屋の幅・高さに対する %）
const FLOORS = {
  "img/rooms/oneroom.jpg": { left: 10, right: 90, top: 56, bottom: 95 },
  "img/rooms/house1.jpg": { left: 12, right: 88, top: 52, bottom: 95 },
  "img/rooms/house2_1f.jpg": { left: 10, right: 82, top: 54, bottom: 95 },
  "img/rooms/house2_2f.jpg": { left: 12, right: 88, top: 56, bottom: 95 },
  "img/rooms/garden.jpg": { left: 14, right: 86, top: 42, bottom: 84 },
  "img/rooms/pool.jpg": { left: 10, right: 90, top: 64, bottom: 95 },
};

// category: furniture（かぐ・かでん） / clothes（ようふく） / accessory（こもの）
// slot: きせかえで身につける場所（clothes / bag / head）
// image を指定すると絵文字のかわりに画像を表示する（例: image: "img/items/bed.png"）
// size: かぐの大きさ（部屋の幅に対する %。いちばん手前に置いたときの大きさ）
// wear: 体に合わせる大きさと位置（キャラの fit を基準にする）
//   ようふく { w: 胴の幅の何倍か, dy: えりから上にずらす %, hole: えりぐりを くりぬく だ円の [横, たて] %,
//             head: セットの ぼうし（あたまの こものと同じ書き方 ＋ image） }
//   あたま { w: 頭の幅の何倍か, x: 頭の幅に対する左右のずれ, y: てっぺんから下げる % }
//   バッグ { w: キャラの幅に対する % }
const ITEMS = [
  // かぐ・かでん
  { id: "flower", category: "furniture", name: "はなびん", icon: "💐", price: 50, size: 8 },
  { id: "plant", category: "furniture", name: "かんようしょくぶつ", icon: "🪴", price: 60, size: 12 },
  { id: "chair", category: "furniture", name: "いす", icon: "🪑", price: 60, size: 13 },
  { id: "lamp", category: "furniture", name: "でんき", icon: "💡", price: 80, size: 11 },
  { id: "phone", category: "furniture", name: "でんわ", icon: "☎️", price: 90, size: 7 },
  { id: "clock", category: "furniture", name: "おきどけい", icon: "🕰️", price: 100, size: 10 },
  { id: "mirror", category: "furniture", name: "かがみ", icon: "🪞", price: 100, size: 12 },
  { id: "bear", category: "furniture", name: "くまの ぬいぐるみ", icon: "🧸", price: 120, size: 10 },
  { id: "books", category: "furniture", name: "ほんだな", icon: "📚", price: 120, size: 17 },
  { id: "bed", category: "furniture", name: "ベッド", icon: "🛏️", price: 150, size: 26 },
  { id: "radio", category: "furniture", name: "ラジオ", icon: "📻", price: 150, size: 9 },
  { id: "sofa", category: "furniture", name: "ソファ", icon: "🛋️", price: 200, size: 24 },
  { id: "fish", category: "furniture", name: "すいそう", icon: "🐠", price: 200, size: 13 },
  { id: "tv", category: "furniture", name: "テレビ", icon: "📺", price: 300, size: 16 },
  { id: "toilet", category: "furniture", name: "トイレ", icon: "🚽", price: 300, size: 15 },
  { id: "game", category: "furniture", name: "ゲームき", icon: "🎮", price: 350, size: 8 },
  { id: "pc", category: "furniture", name: "パソコン", icon: "💻", price: 400, size: 11 },
  { id: "guitar", category: "furniture", name: "ギター", icon: "🎸", price: 450, size: 15 },
  { id: "bath", category: "furniture", name: "おふろ", icon: "🛁", price: 500, size: 24 },
  { id: "piano", category: "furniture", name: "ピアノ", icon: "🎹", price: 800, size: 22 },
  { id: "sunflower", category: "furniture", name: "ひまわり", icon: "🌻", price: 80, size: 14 },
  { id: "tree", category: "furniture", name: "木", icon: "🌳", price: 150, size: 30 },
  { id: "tent", category: "furniture", name: "テント", icon: "⛺", price: 600, size: 30 },
  { id: "fountain", category: "furniture", name: "ふんすい", icon: "⛲", price: 1200, size: 28 },

  // ようふく
  { id: "tshirt", category: "clothes", slot: "clothes", name: "Tシャツ", icon: "👕", price: 100, image: "img/items/tshirt.png", wear: { w: 1.4, dy: 3 } },
  { id: "blouse", category: "clothes", slot: "clothes", name: "ブラウス", icon: "👚", price: 150, image: "img/items/blouse.png", wear: { w: 1.4, dy: 3 } },
  { id: "vest", category: "clothes", slot: "clothes", name: "ベスト", icon: "🦺", price: 150, image: "img/items/vest.png", wear: { w: 1.1, dy: 2 } },
  { id: "dress", category: "clothes", slot: "clothes", name: "ワンピース", icon: "👗", price: 200, image: "img/items/dress.png", wear: { w: 1.35, dy: 3, hole: [12, 11] } },
  { id: "swim", category: "clothes", slot: "clothes", name: "みずぎ", icon: "🩱", price: 200, image: "img/items/swim.png", wear: { w: 1.0, dy: 1 } },
  { id: "coat", category: "clothes", slot: "clothes", name: "コート", icon: "🧥", price: 250, image: "img/items/coat.png", wear: { w: 1.45, dy: 3 } },
  { id: "dogi", category: "clothes", slot: "clothes", name: "どうぎ", icon: "🥋", price: 300, image: "img/items/dogi.png", wear: { w: 1.45, dy: 3 } },
  { id: "kimono", category: "clothes", slot: "clothes", name: "きもの", icon: "👘", price: 500, image: "img/items/kimono.png", wear: { w: 1.4, dy: 3 } },
  { id: "nurse", category: "clothes", slot: "clothes", name: "ナースふく", icon: "👩‍⚕️", price: 350, image: "img/items/nurse.png",
    wear: { w: 1.35, dy: 3, head: { image: "img/items/nursecap.png", w: 0.55, y: 4 } } },
  { id: "police", category: "clothes", slot: "clothes", name: "けいさつかん", icon: "👮", price: 400, image: "img/items/police.png",
    wear: { w: 1.5, dy: 4, head: { image: "img/items/policecap.png", w: 0.75, y: 7 } } },
  { id: "princess", category: "clothes", slot: "clothes", name: "おひめさま", icon: "👸", price: 800, image: "img/items/princess.png",
    wear: { w: 1.6, dy: 3, head: { image: "img/items/tiara.png", w: 0.55, y: 3 } } },
  { id: "heroine", category: "clothes", slot: "clothes", name: "プリキュア", icon: "💖", price: 900, image: "img/items/heroine.png",
    wear: { w: 1.6, dy: 4, head: { image: "img/items/heroinebow.png", w: 0.5, x: 0.3, y: 7 } } },
  { id: "robot", category: "clothes", slot: "clothes", name: "ロボット", icon: "🤖", price: 1200, image: "img/items/robot.png",
    wear: { w: 2.1, dy: 3, head: { image: "img/items/robothead.png", w: 0.95, y: 14 } } },

  // こもの（バッグ・リボン・ぼうし）
  { id: "ribbon", category: "accessory", slot: "head", name: "リボン", icon: "🎀", price: 80, image: "img/items/ribbon.png", wear: { w: 0.45, x: 0.32, y: 6 } },
  { id: "pouch", category: "accessory", slot: "bag", name: "ポーチ", icon: "👝", price: 100, image: "img/items/pouch.png", wear: { w: 22 } },
  { id: "flowerhair", category: "accessory", slot: "head", name: "はなかざり", icon: "🌸", price: 100, image: "img/items/flowerhair.png", wear: { w: 0.85, y: 5 } },
  { id: "basket", category: "accessory", slot: "bag", name: "かご", icon: "🧺", price: 120, image: "img/items/basket.png", wear: { w: 28 } },
  { id: "handbag", category: "accessory", slot: "bag", name: "ハンドバッグ", icon: "👜", price: 150, image: "img/items/handbag.png", wear: { w: 26 } },
  { id: "cap", category: "accessory", slot: "head", name: "キャップ", icon: "🧢", price: 150, image: "img/items/cap.png", wear: { w: 0.8, y: 9 } },
  { id: "backpack", category: "accessory", slot: "bag", name: "リュック", icon: "🎒", price: 200, image: "img/items/backpack.png", wear: { w: 28 } },
  { id: "strawhat", category: "accessory", slot: "head", name: "むぎわらぼうし", icon: "👒", price: 200, image: "img/items/strawhat.png", wear: { w: 1.05, y: 6 } },
  { id: "briefcase", category: "accessory", slot: "bag", name: "かばん", icon: "💼", price: 250, image: "img/items/briefcase.png", wear: { w: 28 } },
  { id: "tophat", category: "accessory", slot: "head", name: "シルクハット", icon: "🎩", price: 300, image: "img/items/tophat.png", wear: { w: 0.6, y: 5 } },
  { id: "gradcap", category: "accessory", slot: "head", name: "はかせぼう", icon: "🎓", price: 400, image: "img/items/gradcap.png", wear: { w: 0.85, y: 6 } },
  { id: "crown", category: "accessory", slot: "head", name: "おうかん", icon: "👑", price: 1000, image: "img/items/crown.png", wear: { w: 0.55, y: 3 } },
];

// 後ろ姿用の画像（img/items/{名前}_back.png）がある ぼうし類。ないものは後ろ姿でも前の画像を使う
// （服は 着た絵 img/dressed/ に うしろ姿も あるので いらない）
const BACK_IMAGES = ["nursecap", "policecap", "heroinebow", "ribbon", "cap", "strawhat", "tophat", "gradcap"];

function backImageOf(image) {
  const m = image && image.match(/([^/]+)\.png$/);
  return m && BACK_IMAGES.includes(m[1]) ? image.replace(/\.png$/, "_back.png") : image;
}

const SHOP_TABS = [
  { id: "house", name: "おうち" },
  { id: "furniture", name: "かぐ・かでん" },
  { id: "clothes", name: "ようふく" },
  { id: "accessory", name: "こもの" },
  { id: "friends", name: "なかま" },
];

const SLOT_NAMES = { clothes: "ようふく", bag: "バッグ", head: "あたま" };

function getItem(id) {
  return ITEMS.find((i) => i.id === id);
}

function getHouse(id) {
  return HOUSES.find((h) => h.id === id);
}
