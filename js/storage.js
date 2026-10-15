const SAVE_KEY = "manabi-ouchi-v1";

// お店から なくなった商品。古いセーブに のこっていたら 取りのぞく（ポイントは もどさない）
const REMOVED_ITEMS = ["vest", "pouch", "phone", "clock", "fish", "game", "guitar", "fountain", "flowerhair", "headphones"];

// なくなった おうち → かわりに すむ おうち（へやの なまえ 1f・2f・garden が おなじなので かぐも そのまま）
const MOVED_HOUSES = { garden: "pool" };

const Store = {
  data: null,

  defaults() {
    return {
      characters: [], // 一緒にくらしているキャラクターのid
      partner: null, // ホームやクイズに出てくるキャラクター
      points: 200000,
      house: "oneroom",
      owned: [], // 買った商品のid
      placements: [], // { uid, item, area, x, y }
      outfits: {}, // { キャラid: { clothes, bag, head } }
      highScores: {}, // { "パックid_問題数_難易度": 点数 }
      seen: {}, // { "パックid_難易度": [問題id] }
      wrong: {}, // { パックid: [問題id] }
      lastLogin: null,
      loginStreak: 0,
      sound: true,
    };
  },

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      this.data = Object.assign(this.defaults(), saved || {});
    } catch (e) {
      this.data = this.defaults();
    }
    this.dropRemoved();
    if (MOVED_HOUSES[this.data.house]) {
      this.data.house = MOVED_HOUSES[this.data.house];
      this.save();
    }
    return this.data;
  },

  dropRemoved() {
    const d = this.data;
    const gone = (id) => REMOVED_ITEMS.includes(id);
    d.owned = d.owned.filter((id) => !gone(id));
    d.placements = d.placements.filter((p) => !gone(p.item));
    for (const outfit of Object.values(d.outfits)) {
      for (const slot of Object.keys(outfit)) {
        if (gone(outfit[slot])) delete outfit[slot];
      }
    }
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.data = this.defaults();
  },

  addPoints(n) {
    this.data.points += n;
    this.save();
  },

  spend(n) {
    if (this.data.points < n) return false;
    this.data.points -= n;
    this.save();
    return true;
  },

  owns(itemId) {
    return this.data.owned.includes(itemId);
  },
};
