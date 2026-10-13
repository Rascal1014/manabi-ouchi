const SAVE_KEY = "manabi-ouchi-v1";

const Store = {
  data: null,

  defaults() {
    return {
      characters: [], // 一緒にくらしているキャラクターのid
      partner: null, // ホームやクイズに出てくるキャラクター
      points: 0,
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
    return this.data;
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
