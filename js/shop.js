const Shop = {
  tab: "house",

  open(tab) {
    if (tab) this.tab = tab;
    this.renderTabs();
    this.renderList();
    App.show("shop");
  },

  renderTabs() {
    const row = $("#shop-tabs");
    row.innerHTML = "";
    SHOP_TABS.forEach((t) => {
      const b = el("button", "tab" + (t.id === this.tab ? " active" : ""), t.name);
      b.onclick = () => {
        Sound.tap();
        this.tab = t.id;
        this.renderTabs();
        this.renderList();
      };
      row.appendChild(b);
    });
  },

  renderList() {
    App.updatePoints();
    const list = $("#shop-list");
    list.innerHTML = "";
    list.scrollTop = 0;
    if (this.tab === "house") return this.renderHouses(list);
    if (this.tab === "friends") return this.renderFriends(list);

    ITEMS.filter((i) => i.category === this.tab)
      .sort((a, b) => a.price - b.price)
      .forEach((item) => {
        const owned = Store.owns(item.id);
        const extra = item.slot ? SLOT_NAMES[item.slot] : "";
        list.appendChild(
          this.card({
            visual: renderItemVisual(item),
            name: item.name,
            note: extra,
            price: item.price,
            state: owned ? "owned" : null,
            onBuy: () => this.buyItem(item),
          })
        );
      });
  },

  renderHouses(list) {
    const currentIndex = HOUSES.findIndex((h) => h.id === Store.data.house);
    HOUSES.forEach((house, i) => {
      let state = null;
      if (i === currentIndex) state = "current";
      else if (i < currentIndex) state = "owned";
      else if (i > currentIndex + 1) state = "locked";
      const areas = Object.keys(house.rooms).map((a) => areaName(house, a)).join("・");
      const img = el("img", "item-visual house-thumb");
      img.src = house.image;
      list.appendChild(
        this.card({
          visual: img,
          name: house.name,
          note: `${areas}　かぐ ${house.maxItems}こ まで`,
          price: house.price,
          state,
          onBuy: () => this.buyHouse(house),
        })
      );
    });
  },

  renderFriends(list) {
    const ownedCount = Store.data.characters.length;
    CHARACTERS.forEach((c) => {
      const owned = Store.data.characters.includes(c.id);
      const price = FRIEND_PRICES[ownedCount - 1];
      const img = el("img", "item-visual chara-thumb");
      img.src = charImg(c.id, "normal");
      list.appendChild(
        this.card({
          visual: img,
          name: c.name,
          note: c.animal,
          price: owned ? null : price,
          state: owned ? "family" : null,
          onBuy: () => this.buyFriend(c, price),
        })
      );
    });
  },

  // state: owned（もっている） / current（いまの おうち） / family（なかま） / locked（まだ買えない）
  card({ visual, name, note, price, state, onBuy }) {
    const card = el("div", "shop-card");
    card.appendChild(el("div", "shop-visual")).appendChild(visual);
    card.appendChild(el("div", "shop-name", name));
    if (note) card.appendChild(el("div", "shop-note", note));

    const labels = { owned: "もっている", current: "いまの おうち", family: "なかま", locked: "まだ かえないよ" };
    if (state) {
      card.classList.add("is-" + state);
      card.appendChild(el("div", "shop-state", labels[state]));
      return card;
    }
    const lack = price - Store.data.points;
    const btn = el("button", "btn btn-orange shop-buy", `${formatPoints(price)} てん`);
    if (lack > 0) {
      card.classList.add("is-short");
      card.appendChild(el("div", "shop-lack", `あと ${formatPoints(lack)} てん`));
    }
    btn.onclick = () => this.confirmBuy(name, price, onBuy);
    card.appendChild(btn);
    return card;
  },

  confirmBuy(name, price, onBuy) {
    if (Store.data.points < price) {
      Sound.wrong();
      toast("ポイントが たりないよ。べんきょうして ためよう！");
      return;
    }
    Sound.tap();
    showModal({
      title: `${name} を かう？`,
      body: `${formatPoints(price)} てん つかうよ。`,
      buttons: [
        { label: "やめる", className: "btn-gray" },
        {
          label: "かう！",
          className: "btn-orange",
          onClick: () => {
            if (!Store.spend(price)) return;
            onBuy();
            Sound.buy();
            this.renderList();
          },
        },
      ],
    });
  },

  buyItem(item) {
    Store.data.owned.push(item.id);
    Store.save();
    const where = item.category === "furniture" ? "おうちで かざってね！" : "きせかえで きてみてね！";
    toast(`${item.name} を かったよ！ ${where}`);
  },

  buyHouse(house) {
    Store.data.house = house.id;
    Store.data.placements = [];
    Store.save();
    toast(`${house.name} に ひっこしたよ！ かぐは もちものに もどしたよ`);
  },

  buyFriend(c, price) {
    Store.data.characters.push(c.id);
    Store.save();
    const img = renderCharacter(c.id, "happy", { className: "modal-chara" });
    showModal({ title: `${c.name} が なかまに なったよ！`, body: c.profile, image: img });
  },
};
