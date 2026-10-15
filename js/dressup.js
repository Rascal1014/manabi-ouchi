const Dressup = {
  charId: null,
  slot: "clothes",

  open() {
    if (!Store.data.characters.includes(this.charId)) this.charId = Store.data.partner;
    this.render();
    App.show("dress");
  },

  render() {
    const tabs = $("#dress-charas");
    tabs.innerHTML = "";
    tabs.hidden = Store.data.characters.length < 2;
    Store.data.characters.forEach((id) => {
      const b = el("button", "tab" + (id === this.charId ? " active" : ""), getCharacter(id).name);
      b.onclick = () => {
        Sound.tap();
        this.charId = id;
        this.render();
      };
      tabs.appendChild(b);
    });

    const stage = $("#dress-stage");
    stage.innerHTML = "";
    stage.appendChild(renderCharacter(this.charId, "normal"));

    const slotTabs = $("#dress-slots");
    slotTabs.innerHTML = "";
    Object.keys(SLOT_NAMES).forEach((s) => {
      const b = el("button", "tab" + (s === this.slot ? " active" : ""), SLOT_NAMES[s]);
      b.onclick = () => {
        Sound.tap();
        this.slot = s;
        this.render();
      };
      slotTabs.appendChild(b);
    });

    const outfit = Store.data.outfits[this.charId] || {};
    const list = $("#dress-items");
    list.innerHTML = "";

    const none = el("button", "inventory-item" + (!outfit[this.slot] ? " active" : ""));
    none.appendChild(el("span", "item-visual", "✖️"));
    none.appendChild(el("span", "inventory-name", "なし"));
    none.onclick = () => this.wear(null);
    list.appendChild(none);

    const items = Store.data.owned.map(getItem).filter((i) => i && i.slot === this.slot);
    items.forEach((item) => {
      const b = el("button", "inventory-item" + (outfit[this.slot] === item.id ? " active" : ""));
      b.appendChild(renderItemVisual(item));
      b.appendChild(el("span", "inventory-name", item.name));
      b.onclick = () => this.wear(item.id);
      list.appendChild(b);
    });
    if (!items.length) {
      list.appendChild(el("div", "inventory-empty", "まだ もっていないよ。ショップで かってね！"));
    }
  },

  wear(itemId) {
    Sound.tap();
    const outfit = Store.data.outfits[this.charId] || {};
    outfit[this.slot] = itemId;
    Store.data.outfits[this.charId] = outfit;
    Store.save();
    this.render();
  },
};
