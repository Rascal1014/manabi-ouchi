// 家のタイプ。上から順にグレードアップする。
// image: ショップに出す外観 / rooms: おうち画面で切りかえられる場所と、その背景 / maxItems: 置ける家具の数
const HOUSES = [
  {
    id: "oneroom", name: "ワンルーム", price: 0, maxItems: 6,
    image: "img/houses/oneroom.webp",
    rooms: { "1f": "img/rooms/oneroom.webp" },
  },
  {
    id: "house1", name: "1かいだて", price: 1000, maxItems: 10,
    image: "img/houses/house1.webp",
    rooms: { "1f": "img/rooms/house1.webp" },
  },
  {
    id: "house2", name: "2かいだて", price: 1500, maxItems: 18,
    image: "img/houses/house2.webp",
    rooms: { "1f": "img/rooms/house2_1f.webp", "2f": "img/rooms/house2_2f.webp" },
  },
  {
    id: "pool", name: "プールつき", price: 3000, maxItems: 26,
    image: "img/houses/pool.webp",
    rooms: { "1f": "img/rooms/pool_1f.webp", "2f": "img/rooms/pool_2f.webp", garden: "img/rooms/pool.webp" },
  },
  {
    // 1f・2f の キーを つかうのは、ひっこす前の 1かい・2かいの かぐを そのまま うつすため
    id: "castle", name: "おしろ", price: 5000, maxItems: 34,
    image: "img/houses/castle.webp",
    rooms: {
      garden: "img/rooms/castle_garden.webp",
      "1f": "img/rooms/castle_entrance.webp",
      "2f": "img/rooms/castle_hall.webp",
      king: "img/rooms/castle_king.webp",
    },
    areaNames: { garden: "にわ", "1f": "ホール", "2f": "パーティー", king: "おうさま" },
  },
];

const AREA_NAMES = { "1f": "1かい", "2f": "2かい", garden: "にわ" };

function areaName(house, area) {
  return (house.areaNames && house.areaNames[area]) || AREA_NAMES[area];
}

// 背景ごとの、キャラが歩ける床の範囲（足もとの位置。部屋の幅・高さに対する %）
const FLOORS = {
  "img/rooms/oneroom.webp": { left: 10, right: 90, top: 52, bottom: 95 },
  "img/rooms/house1.webp": { left: 12, right: 88, top: 52, bottom: 95 },
  "img/rooms/house2_1f.webp": { left: 10, right: 82, top: 54, bottom: 95 },
  "img/rooms/house2_2f.webp": { left: 12, right: 88, top: 56, bottom: 95 },
  "img/rooms/pool.webp": { left: 10, right: 90, top: 64, bottom: 95 },
  "img/rooms/pool_1f.webp": { left: 8, right: 84, top: 56, bottom: 95 },
  "img/rooms/pool_2f.webp": { left: 10, right: 90, top: 52, bottom: 95 },
  // おしろは 奥に いる どうぶつたちに かさならないよう、床の上のはしを 手前にする
  "img/rooms/castle_garden.webp": { left: 8, right: 92, top: 58, bottom: 95 },
  "img/rooms/castle_entrance.webp": { left: 8, right: 92, top: 64, bottom: 95 },
  "img/rooms/castle_hall.webp": { left: 8, right: 92, top: 64, bottom: 95 },
  "img/rooms/castle_king.webp": { left: 8, right: 92, top: 60, bottom: 95 },
};

// category: furniture（かぐ・かでん） / clothes（ようふく） / accessory（こもの）
// slot: きせかえで身につける場所（clothes / bag / head）
// image を指定すると絵文字のかわりに画像を表示する（例: image: "img/items/bed.webp"）
// size: かぐの大きさ（部屋の幅に対する %。いちばん手前に置いたときの大きさ）
// wear: 体に合わせる大きさと位置（キャラの fit を基準にする）
//   ようふく { w: 胴の幅の何倍か, dy: えりから上にずらす %, hole: えりぐりを くりぬく だ円の [横, たて] %,
//             head: セットの ぼうし（あたまの こものと同じ書き方 ＋ image） }
//   あたま { w: 頭の幅の何倍か, x: 頭の幅に対する左右のずれ, y: てっぺんから下げる % }
//   アクセサリ { hold: もちかた, w: キャラの幅に対する %, ax・ay: 手で つかむ 絵の中の位置（0〜1） }
//     hold: hand（手でもつ）/ shoulder（かたに かける）/ back（せおう。前からは front の かたひもだけ）
//           / pull（ひっぱる）/ both（りょう手で かかえる）
const ITEMS = [
  // かぐ・かでん（画像は img/furniture/{id}.webp。size は 絵の 長いほうの辺）
  { id: "flower", category: "furniture", name: "はなびん", icon: "💐", price: 100, size: 11, image: "img/furniture/flower.webp" },
  { id: "pot_tulip", category: "furniture", name: "はちうえ（チューリップ）", icon: "🌷", price: 100, size: 17, image: "img/furniture/pot_tulip.webp" },
  { id: "pot_rose", category: "furniture", name: "はちうえ（バラ）", icon: "🌹", price: 100, size: 17, image: "img/furniture/pot_rose.webp" },
  { id: "pot_lily", category: "furniture", name: "はちうえ（すずらん）", icon: "🪻", price: 100, size: 17, image: "img/furniture/pot_lily.webp" },
  { id: "plant", category: "furniture", name: "かんようしょくぶつ", icon: "🪴", price: 100, size: 13, image: "img/furniture/plant.webp" },
  { id: "chair", category: "furniture", name: "いす", icon: "🪑", price: 100, size: 16, image: "img/furniture/chair.webp" },
  { id: "lamp", category: "furniture", name: "でんき", icon: "💡", price: 120, size: 15, image: "img/furniture/lamp.webp" },
  { id: "sunflower", category: "furniture", name: "ひまわり", icon: "🌻", price: 120, size: 17, image: "img/furniture/sunflower.webp" },
  { id: "dandelion", category: "furniture", name: "たんぽぽ", icon: "🌼", price: 120, size: 17, image: "img/furniture/dandelion.webp" },
  { id: "pansy", category: "furniture", name: "パンジー", icon: "🌸", price: 120, size: 17, image: "img/furniture/pansy.webp" },
  { id: "asagao", category: "furniture", name: "あさがお", icon: "🌺", price: 120, size: 17, image: "img/furniture/asagao.webp" },
  { id: "minitomato", category: "furniture", name: "ミニトマト", icon: "🍅", price: 120, size: 17, image: "img/furniture/minitomato.webp" },
  { id: "sakura", category: "furniture", name: "さくらの 小さな木", icon: "🌸", price: 180, size: 20, image: "img/furniture/sakura.webp" },
  { id: "umbrella", category: "furniture", name: "かさたて", icon: "☂️", price: 150, size: 17, image: "img/furniture/umbrella.webp" },
  { id: "mirror", category: "furniture", name: "かがみ", icon: "🪞", price: 150, size: 18, image: "img/furniture/mirror.webp" },
  { id: "bear", category: "furniture", name: "くまの ぬいぐるみ", icon: "🧸", price: 180, size: 10, image: "img/furniture/bear.webp" },
  { id: "books", category: "furniture", name: "ほんだな", icon: "📚", price: 180, size: 24, image: "img/furniture/books.webp" },
  { id: "table", category: "furniture", name: "テーブル", icon: "🍰", price: 180, size: 18, image: "img/furniture/table.webp" },
  { id: "radio", category: "furniture", name: "ラジオ", icon: "📻", price: 220, size: 9, image: "img/furniture/radio.webp" },
  { id: "tree", category: "furniture", name: "木", icon: "🌳", price: 220, size: 28, image: "img/furniture/tree.webp" },
  { id: "sofa", category: "furniture", name: "ソファ", icon: "🛋️", price: 300, size: 24, image: "img/furniture/sofa.webp" },
  { id: "painting", category: "furniture", name: "かいが", icon: "🖼️", price: 300, size: 13, image: "img/furniture/painting.webp" },
  { id: "tv", category: "furniture", name: "テレビ", icon: "📺", price: 450, size: 20, image: "img/furniture/tv.webp" },
  { id: "toilet", category: "furniture", name: "トイレ", icon: "🚽", price: 450, size: 14, image: "img/furniture/toilet.webp" },
  { id: "pc", category: "furniture", name: "パソコン", icon: "💻", price: 600, size: 17, image: "img/furniture/pc.webp" },
  { id: "bed", category: "furniture", name: "てんがいつき ベッド", icon: "🛏️", price: 600, size: 26, image: "img/furniture/bed.webp" },
  { id: "kotatsu", category: "furniture", name: "こたつ", icon: "🍵", price: 600, size: 26, image: "img/furniture/kotatsu.webp" },
  { id: "bath", category: "furniture", name: "おふろ", icon: "🛁", price: 750, size: 22, image: "img/furniture/bath.webp" },
  { id: "tent", category: "furniture", name: "テント", icon: "⛺", price: 900, size: 28, image: "img/furniture/tent.webp" },
  { id: "piano", category: "furniture", name: "ピアノ", icon: "🎹", price: 1000, size: 20, image: "img/furniture/piano.webp" },

  // ようふく
  { id: "tshirt", category: "clothes", slot: "clothes", name: "Tシャツ", icon: "👕", price: 300, image: "img/items/tshirt.webp", wear: { w: 1.4, dy: 3 } },
  { id: "blouse", category: "clothes", slot: "clothes", name: "ブラウス", icon: "👚", price: 350, image: "img/items/blouse.webp", wear: { w: 1.4, dy: 3 } },
  { id: "dress", category: "clothes", slot: "clothes", name: "ワンピース", icon: "👗", price: 400, image: "img/items/dress.webp", wear: { w: 1.35, dy: 3, hole: [12, 11] } },
  { id: "swim", category: "clothes", slot: "clothes", name: "みずぎ", icon: "🩱", price: 400, image: "img/items/swim.webp", wear: { w: 1.0, dy: 1 } },
  { id: "coat", category: "clothes", slot: "clothes", name: "コート", icon: "🧥", price: 450, image: "img/items/coat.webp", wear: { w: 1.45, dy: 3 } },
  { id: "dogi", category: "clothes", slot: "clothes", name: "どうぎ", icon: "🥋", price: 500, image: "img/items/dogi.webp", wear: { w: 1.45, dy: 3 } },
  { id: "kimono", category: "clothes", slot: "clothes", name: "きもの", icon: "👘", price: 700, image: "img/items/kimono.webp", wear: { w: 1.4, dy: 3 } },
  { id: "delivery", category: "clothes", slot: "clothes", name: "はいたついん", icon: "📦", price: 500, image: "img/items/delivery.webp",
    wear: { head: { image: "img/items/deliverycap.webp", w: 1.0, y: 7 } } },
  { id: "chef", category: "clothes", slot: "clothes", name: "シェフ", icon: "🧑‍🍳", price: 550, image: "img/items/chef.webp",
    wear: { head: { image: "img/items/chefhat.webp", w: 0.85, y: 6 } } },
  { id: "waitress", category: "clothes", slot: "clothes", name: "ウェイトレス", icon: "☕", price: 500, image: "img/items/waitress.webp",
    wear: { head: { image: "img/items/katyusha.webp", w: 0.9, y: 7 } } },
  { id: "ca", category: "clothes", slot: "clothes", name: "キャビンアテンダント", icon: "✈️", price: 650, image: "img/items/ca.webp",
    wear: { head: { image: "img/items/cacap.webp", w: 0.7, y: 9 } } },
  { id: "wedding", category: "clothes", slot: "clothes", name: "ウェディングドレス", icon: "👰", price: 950, image: "img/items/wedding.webp",
    wear: { head: { image: "img/items/veil.webp", w: 1.35, y: 33 } } },
  { id: "nurse", category: "clothes", slot: "clothes", name: "ナースふく", icon: "👩‍⚕️", price: 550, image: "img/items/nurse.webp",
    wear: { w: 1.35, dy: 3, head: { image: "img/items/nursecap.webp", w: 0.75, y: 9 } } },
  { id: "police", category: "clothes", slot: "clothes", name: "けいさつかん", icon: "👮", price: 600, image: "img/items/police.webp",
    wear: { w: 1.5, dy: 4, head: { image: "img/items/policecap.webp", w: 1.15, y: 11 } } },
  { id: "princess", category: "clothes", slot: "clothes", name: "おひめさま", icon: "👸", price: 850, image: "img/items/princess.webp",
    wear: { w: 1.6, dy: 3, head: { image: "img/items/tiara.webp", w: 0.55, y: 3 } } },
  { id: "heroine", category: "clothes", slot: "clothes", name: "プリキュア", icon: "💖", price: 900, image: "img/items/heroine.webp",
    wear: { w: 1.6, dy: 4, head: { image: "img/items/heroinebow.webp", w: 0.5, x: 0.3, y: 7 } } },
  { id: "robot", category: "clothes", slot: "clothes", name: "ロボット", icon: "🤖", price: 1000, image: "img/items/robot.webp",
    wear: { w: 2.1, dy: 3, head: { image: "img/items/robothead.webp", w: 0.95, y: 14 } } },

  // アクセサリ（もつもの）
  { id: "basket", category: "accessory", slot: "bag", name: "かご", icon: "🧺", price: 330, image: "img/items/basket.webp", wear: { hold: "hand", w: 30, ay: 0.08 } },
  { id: "tote", category: "accessory", slot: "bag", name: "トートバッグ", icon: "👜", price: 330, image: "img/items/tote.webp", wear: { hold: "shoulder", w: 30, side: "img/items/tote_side.webp" } },
  { id: "handbag", category: "accessory", slot: "bag", name: "ハンドバッグ", icon: "👛", price: 350, image: "img/items/handbag.webp", wear: { hold: "hand", w: 26, ay: 0.05, side: "img/items/handbag_side.webp" } },
  { id: "present", category: "accessory", slot: "bag", name: "プレゼント", icon: "🎁", price: 350, image: "img/items/present.webp", wear: { hold: "both", w: 42 } },
  { id: "hammer", category: "accessory", slot: "bag", name: "ピコピコハンマー", icon: "🔨", price: 380, image: "img/items/hammer.webp", wear: { hold: "hand", w: 26, ay: 0.85 } },
  { id: "backpack", category: "accessory", slot: "bag", name: "ランドセル", icon: "🎒", price: 400, image: "img/items/backpack.webp", wear: { hold: "back", w: 1.2, front: "img/items/backpack_straps.webp" } },
  { id: "parasol", category: "accessory", slot: "bag", name: "ひがさ", icon: "⛱️", price: 400, image: "img/items/parasol.webp", wear: { hold: "hand", w: 50, ax: 0.42, ay: 0.92, behind: true } },
  { id: "briefcase", category: "accessory", slot: "bag", name: "かばん", icon: "💼", price: 450, image: "img/items/briefcase.webp", wear: { hold: "hand", w: 30, ay: 0.05, side: "img/items/briefcase_side.webp" } },
  { id: "boston", category: "accessory", slot: "bag", name: "ボストンバッグ", icon: "👜", price: 450, image: "img/items/boston.webp", wear: { hold: "hand", w: 30, ay: 0.05, side: "img/items/boston_side.webp" } },
  { id: "carry", category: "accessory", slot: "bag", name: "キャリーバッグ", icon: "🧳", price: 500, image: "img/items/carry.webp", wear: { hold: "pull", w: 30, ay: 0.03, side: "img/items/carry_side.webp" } },
  { id: "hiking", category: "accessory", slot: "bag", name: "とざんの リュック", icon: "🏔️", price: 550, image: "img/items/hiking.webp", wear: { hold: "back", w: 1.12, front: "img/items/hiking_straps.webp" } },
  { id: "stick", category: "accessory", slot: "bag", name: "まほうの ステッキ", icon: "🪄", price: 800, image: "img/items/stick.webp", wear: { hold: "hand", w: 26, ax: 0.3, ay: 0.72, side: "img/items/stick_side.webp" } },
  { id: "angelwings", category: "accessory", slot: "bag", name: "てんしの はね", icon: "🪽", price: 700, image: "img/items/angelwings.webp", wear: { hold: "wings", w: 2.4 } },
  { id: "devilwings", category: "accessory", slot: "bag", name: "あくまの はね", icon: "🦇", price: 700, image: "img/items/devilwings.webp", wear: { hold: "wings", w: 2.4 } },
  { id: "sword", category: "accessory", slot: "bag", name: "せいけん", icon: "🗡️", price: 1000, image: "img/items/sword.webp", wear: { hold: "hand", w: 36, ax: 0.2, ay: 0.82, side: "img/items/sword_side.webp" } },

  // こもの（あたま）
  { id: "ribbon", category: "accessory", slot: "head", name: "リボン", icon: "🎀", price: 300, image: "img/items/ribbon.webp", wear: { w: 0.45, x: 0.32, y: 6 } },
  { id: "hachimaki", category: "accessory", slot: "head", name: "はちまき", icon: "🎌", price: 300, image: "img/items/hachimaki.webp", wear: { w: 1.0, y: 14 } },
  { id: "cap", category: "accessory", slot: "head", name: "キャップ", icon: "🧢", price: 350, image: "img/items/cap.webp", wear: { w: 1.1, y: 15 } },
  { id: "strawhat", category: "accessory", slot: "head", name: "むぎわらぼうし", icon: "👒", price: 400, image: "img/items/strawhat.webp", wear: { w: 1.6, y: 13 } },
  { id: "goggles", category: "accessory", slot: "head", name: "ゴーグル", icon: "🥽", price: 400, image: "img/items/goggles.webp", wear: { w: 0.95, y: 12 } },
  { id: "tophat", category: "accessory", slot: "head", name: "シルクハット", icon: "🎩", price: 500, image: "img/items/tophat.webp", wear: { w: 1.05, y: 11 } },
  { id: "halo", category: "accessory", slot: "head", name: "てんしの わ", icon: "😇", price: 500, image: "img/items/halo.webp", wear: { w: 0.55, y: -2 } },
  { id: "horns", category: "accessory", slot: "head", name: "あくまの つの", icon: "😈", price: 500, image: "img/items/horns.webp", wear: { w: 0.8, y: 5 } },
  { id: "gradcap", category: "accessory", slot: "head", name: "はかせぼう", icon: "🎓", price: 600, image: "img/items/gradcap.webp", wear: { w: 1.25, y: 12 } },
  { id: "witch", category: "accessory", slot: "head", name: "まじょの ぼうし", icon: "🧙", price: 600, image: "img/items/witch.webp", wear: { w: 1.15, y: 10 } },
  { id: "crown", category: "accessory", slot: "head", name: "おうかん", icon: "👑", price: 1000, image: "img/items/crown.webp", wear: { w: 0.95, y: 9 } },
  { id: "tiara", category: "accessory", slot: "head", name: "ティアラ", icon: "💎", price: 500, image: "img/items/tiara_deluxe.webp", wear: { w: 0.85, y: 9 } },
  { id: "knit", category: "accessory", slot: "head", name: "ニットぼう", icon: "🧶", price: 350, image: "img/items/knit.webp", wear: { w: 1.0, y: 11 } },
  { id: "santa", category: "accessory", slot: "head", name: "サンタの ぼうし", icon: "🎅", price: 450, image: "img/items/santa.webp", wear: { w: 1.2, y: 11 } },
  { id: "pirate", category: "accessory", slot: "head", name: "かいぞくの ぼうし", icon: "🏴‍☠️", price: 500, image: "img/items/pirate.webp", wear: { w: 1.3, y: 10 } },
];

// 後ろ姿用の画像（img/items/{名前}_back.webp）がある ぼうし類。ないものは後ろ姿でも前の画像を使う
// （服は 着た絵 img/dressed/ に うしろ姿も あるので いらない）
const BACK_IMAGES = [
  "nursecap", "policecap", "heroinebow", "ribbon", "cap", "strawhat", "tophat", "gradcap",
  "hachimaki", "goggles", "witch", "deliverycap", "cacap", "veil", "santa", "knit", "pirate",
];

function backImageOf(image) {
  const m = image && image.match(/([^/]+)\.webp$/);
  return m && BACK_IMAGES.includes(m[1]) ? image.replace(/\.webp$/, "_back.webp") : image;
}

const SHOP_TABS = [
  { id: "house", name: "おうち" },
  { id: "furniture", name: "かぐ・かでん" },
  { id: "clothes", name: "ようふく" },
  { id: "accessory", name: "こもの" },
  { id: "friends", name: "なかま" },
];

const SLOT_NAMES = { clothes: "ようふく", bag: "アクセサリ", head: "あたま" };

function getItem(id) {
  return ITEMS.find((i) => i.id === id);
}

function getHouse(id) {
  return HOUSES.find((h) => h.id === id);
}
