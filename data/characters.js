// 画像は img/characters/{id}_{normal|happy|cry}.webp（背景を透明にしたもの）
// fit: きせかえを体に合わせる位置。画像の幅・高さに対する %。表情ごとにポーズがちがうので別々に持つ。
//   neck: 首（服のえり）の高さ / bodyX・bodyW: 胴の中心と幅
//   headX・headTop・headW: 頭の中心・てっぺん・幅 / handX・handY: 絵の右がわの手の位置（アクセサリを持つ）
const CHARACTERS = [
  {
    id: "haro",
    name: "ハロちゃん",
    animal: "いぬ",
    profile: "くるくるの けが じまんの トイプードル。みんなと あそぶのが 大すき。",
    fit: {
      normal: { neck: 41, bodyX: 51, bodyW: 43, headX: 50, headTop: 9, headW: 41, handX: 86, handY: 47 },
      happy: { neck: 41, bodyX: 49, bodyW: 38, headX: 50, headTop: 11, headW: 41, handX: 84, handY: 30 },
      cry: { neck: 44, bodyX: 51, bodyW: 42, headX: 51, headTop: 9, headW: 42, handX: 78, handY: 68 },
      walkf1: { neck: 40, bodyX: 51, bodyW: 36, headX: 54, headTop: 9, headW: 37, handX: 85, handY: 56 },
      walkf2: { neck: 41, bodyX: 52, bodyW: 36, headX: 53, headTop: 9, headW: 37, handX: 85, handY: 53 },
      walkf3: { neck: 40, bodyX: 50, bodyW: 36, headX: 52, headTop: 9, headW: 37, handX: 84, handY: 50 },
      walkb1: { neck: 37, bodyX: 49, bodyW: 35, headX: 49, headTop: 9, headW: 35, handX: 82, handY: 57 },
      walkb2: { neck: 37, bodyX: 50, bodyW: 37, headX: 50, headTop: 9, headW: 35, handX: 85, handY: 58 },
      walkb3: { neck: 37, bodyX: 49, bodyW: 35, headX: 49, headTop: 9, headW: 35, handX: 87, handY: 60 },
    },
  },
  {
    id: "ribbon",
    name: "リボンちゃん",
    animal: "ねこ",
    profile: "オレンジの リボンが おきにいりの ねこ。おしゃれが 大すき。",
    fit: {
      normal: { neck: 45, bodyX: 50, bodyW: 39, headX: 50, headTop: 13, headW: 50, handX: 78, handY: 67 },
      happy: { neck: 43, bodyX: 49, bodyW: 34, headX: 51, headTop: 14, headW: 48, handX: 84, handY: 34 },
      cry: { neck: 48, bodyX: 50, bodyW: 37, headX: 51, headTop: 12, headW: 52, handX: 78, handY: 69 },
      walkf1: { neck: 44, bodyX: 50, bodyW: 36, headX: 51, headTop: 13, headW: 47, handX: 77, handY: 62 },
      walkf2: { neck: 46, bodyX: 50, bodyW: 36, headX: 50, headTop: 13, headW: 47, handX: 80, handY: 60 },
      walkf3: { neck: 43, bodyX: 51, bodyW: 33, headX: 53, headTop: 13, headW: 46, handX: 82, handY: 57 },
      walkb1: { neck: 40, bodyX: 50, bodyW: 35, headX: 53, headTop: 13, headW: 44, handX: 80, handY: 58 },
      walkb2: { neck: 40, bodyX: 50, bodyW: 35, headX: 53, headTop: 13, headW: 44, handX: 80, handY: 58 },
      walkb3: { neck: 40, bodyX: 50, bodyW: 35, headX: 53, headTop: 13, headW: 44, handX: 80, handY: 58 },
    },
  },
  {
    id: "pom",
    name: "ポムちゃん",
    animal: "たぬき",
    profile: "あたまの はっぱが じまんの たぬき。のんびり おひるねが 大すき。",
    fit: {
      normal: { neck: 51, bodyX: 50, bodyW: 45, headX: 50, headTop: 17, headW: 56, handX: 76, handY: 66 },
      happy: { neck: 47, bodyX: 48, bodyW: 39, headX: 50, headTop: 17, headW: 50, handX: 82, handY: 38 },
      cry: { neck: 52, bodyX: 50, bodyW: 46, headX: 50, headTop: 15, headW: 56, handX: 75, handY: 67 },
      walkf1: { neck: 50, bodyX: 51, bodyW: 41, headX: 51, headTop: 15, headW: 55, handX: 79, handY: 63 },
      walkf2: { neck: 51, bodyX: 53, bodyW: 40, headX: 52, headTop: 16, headW: 53, handX: 80, handY: 62 },
      walkf3: { neck: 49, bodyX: 52, bodyW: 38, headX: 52, headTop: 15, headW: 53, handX: 80, handY: 60 },
      walkb1: { neck: 44, bodyX: 51, bodyW: 39, headX: 53, headTop: 14, headW: 49, handX: 80, handY: 61 },
      walkb2: { neck: 44, bodyX: 51, bodyW: 39, headX: 53, headTop: 14, headW: 49, handX: 80, handY: 60 },
      walkb3: { neck: 44, bodyX: 51, bodyW: 39, headX: 53, headTop: 14, headW: 49, handX: 81, handY: 58 },
    },
  },
];

// おうちで ときどき、または タップしたときに ふきだしで しゃべる ことば
const TALK_LINES = [
  "あそぼう！",
  "がんばったね！",
  "おなかすいたー",
  "ねむくなってきちゃった",
  "かわいいでしょ？",
  "みかん食べたいな",
  "つかれちゃった",
  "あそんでくるね！",
  "すてきなおうちでしょ",
];

// 2匹目、3匹目を迎えるときのポイント
const FRIEND_PRICES = [1000, 3000];

function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id);
}

// おうちで歩くときの絵。walkf = 手前ななめ向き、walkb = 奥ななめ向き（うしろ姿）。どちらも右向きの絵で、左へは反転して使う
// 1 = 大きくふみ出す、2 = 足がそろう、3 = 反対の足でふみ出す。1→2→3→2 のくり返しで歩かせる
const WALK_POSES = ["walkf1", "walkf2", "walkf3", "walkb1", "walkb2", "walkb3"];
const WALK_CYCLE = [1, 2, 3, 2];

// パーフェクトのときに ランダムで出す、3人の とくべつな絵
const SPECIAL_ARTS = [
  { image: "img/special/sp1.webp", title: "ゆうえんちで あそんだよ！" },
  { image: "img/special/sp2.webp", title: "おはなみ おべんとう" },
  { image: "img/special/sp3.webp", title: "うんどうかいで よーい どん！" },
  { image: "img/special/sp4.webp", title: "こうえんで あそぼう" },
  { image: "img/special/sp5.webp", title: "こたつで みかん" },
  { image: "img/special/sp6.webp", title: "おまつりで わっしょい！" },
  { image: "img/special/sp7.webp", title: "おやすみなさい（ポムちゃん ねぞう わるい…）" },
  { image: "img/special/sp8.webp", title: "がっこうで おべんきょう" },
];

function charImg(id, mood = "normal") {
  return `img/characters/${id}_${mood}.webp`;
}

// 服を着た状態の絵（img/dressed/{キャラ}_{服}_{ポーズ}.webp）がある ポーズ。
// 歩きは 足がそろう 2 の絵がないので、服を着ているときは 1→1→3→3 で歩かせる
const DRESSED_POSES = ["normal", "happy", "cry", "walkf1", "walkf3", "walkb1", "walkb3"];
const DRESSED_WALK_CYCLE = [1, 1, 3, 3];

function dressedImg(charId, clothesId, pose = "normal") {
  const p = DRESSED_POSES.includes(pose) ? pose : pose.replace(/2$/, "1");
  return `img/dressed/${charId}_${clothesId}_${p}.webp`;
}

// 今 着ている服の「着た絵」。服を着ていない（または絵文字の服の）ときは null
function wornClothes(charId) {
  const id = (Store.data.outfits[charId] || {}).clothes;
  const item = id && getItem(id);
  return item && item.image ? item : null;
}

// キャラ本体の絵。服を着ているときは、その服を着た絵にする
function bodyImg(charId, mood = "normal") {
  const clothes = wornClothes(charId);
  return clothes ? dressedImg(charId, clothes.id, mood) : charImg(charId, mood);
}
