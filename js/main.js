const App = {
  init() {
    Store.load();
    this.applyTestPoints();
    this.bindButtons();
    if (!Store.data.characters.length) {
      this.openFirstSelect();
    } else {
      this.goHome();
      this.checkLoginBonus();
    }
    this.registerServiceWorker();
    this.preloadImages();
  },

  // テスト用：?testpoints=20000 で ひらくと ポイントを その数に する（アドレスからは すぐ消す）
  applyTestPoints() {
    const params = new URLSearchParams(location.search);
    const n = parseInt(params.get("testpoints"), 10);
    if (!Number.isFinite(n) || n < 0) return;
    Store.data.points = n;
    Store.save();
    history.replaceState(null, "", location.pathname);
  },

  // 画面を切りかえたときに絵がすぐ出るように、今 使うものだけ 先に読みこんでおく
  // （ショップの商品などは、ひらいたときに読みこむ）
  preloadImages() {
    const urls = new Set();
    const house = HOUSES.find((h) => h.id === Store.data.house);
    if (house) Object.values(house.rooms).forEach((u) => urls.add(u));
    Store.data.characters.forEach((id) => {
      ["normal", "happy", "cry", ...WALK_POSES].forEach((m) => urls.add(charImg(id, m)));
      const clothes = wornClothes(id);
      if (clothes) DRESSED_POSES.forEach((m) => urls.add(dressedImg(id, clothes.id, m)));
    });
    Store.data.owned.map(getItem).filter(Boolean).forEach((i) => {
      const head = i.wear && i.wear.head && i.wear.head.image;
      const front = i.wear && i.wear.front;
      [i.image, head, front].filter(Boolean).forEach((u) => {
        urls.add(u);
        urls.add(backImageOf(u));
      });
    });
    urls.forEach((u) => (new Image().src = u));
  },

  show(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(`#screen-${name}`).classList.add("active");
    document.body.dataset.screen = name;
    this.updatePoints();
    window.scrollTo(0, 0);
  },

  updatePoints() {
    document.querySelectorAll(".points-value").forEach((n) => {
      n.textContent = formatPoints(Store.data.points);
    });
  },

  bindButtons() {
    const on = (sel, fn) => ($(sel).onclick = fn);
    on("#btn-study", () => { Sound.tap(); Quiz.openCourseSelect(); });
    on("#btn-house", () => { Sound.tap(); House.open(); });
    on("#btn-dress", () => { Sound.tap(); Dressup.open(); });
    on("#btn-shop", () => { Sound.tap(); Shop.open(); });
    on("#btn-start", () => { Sound.tap(); Quiz.start(); });
    on("#btn-quit", () => Quiz.quit());
    on("#feedback-next", () => Quiz.next());
    on("#btn-result", () => Quiz.showResult());
    on("#btn-result-home", () => { Sound.tap(); this.goHome(); });
    on("#btn-result-again", () => { Sound.tap(); Quiz.openCourseSelect(); });
    on("#btn-result-shop", () => { Sound.tap(); Shop.open(); });
    on("#house-remove", () => House.removeSelected());
    on("#home-prev", () => this.switchPartner(-1));
    on("#home-next", () => this.switchPartner(1));
    on("#btn-reset", () => { Sound.tap(); this.confirmReset(); });
    on("#btn-sound", () => {
      Store.data.sound = !Store.data.sound;
      Store.save();
      this.renderSoundButton();
      Sound.tap();
    });
    document.querySelectorAll("[data-home]").forEach((b) => {
      b.onclick = () => { Sound.tap(); this.goHome(); };
    });
  },

  renderSoundButton() {
    $("#btn-sound").textContent = Store.data.sound ? "🔊" : "🔇";
  },

  // 子どもが まちがえて おしても 消えないように、2かい たしかめてから セーブを けす
  confirmReset() {
    showModal({
      title: "さいしょから やりなおす？",
      body: "ポイントも、かったものも、なかまも ぜんぶ きえちゃうよ。",
      buttons: [
        { label: "やめる", className: "btn-gray" },
        {
          label: "やりなおす",
          onClick: () =>
            showModal({
              title: "ほんとうに いいの？",
              body: "けしたら もとに もどせないよ。",
              buttons: [
                { label: "やめる", className: "btn-gray" },
                {
                  label: "ぜんぶ けす",
                  className: "btn-pink",
                  onClick: () => {
                    Store.reset();
                    this.openFirstSelect();
                  },
                },
              ],
            }),
        },
      ],
    });
  },

  // ---------- さいしょの なかま選び ----------
  openFirstSelect() {
    const list = $("#first-list");
    list.innerHTML = "";
    CHARACTERS.forEach((c) => {
      const card = el("button", "first-card");
      card.appendChild(renderCharacter(c.id, "normal"));
      card.appendChild(el("div", "first-name", c.name));
      card.appendChild(el("div", "first-profile", c.profile));
      card.onclick = () => {
        Sound.tap();
        showModal({
          title: `${c.name} と くらす？`,
          body: "ほかの なかまは ポイントを ためると むかえられるよ。",
          image: renderCharacter(c.id, "happy", { className: "modal-chara" }),
          buttons: [
            { label: "もどる", className: "btn-gray" },
            { label: "けってい！", className: "btn-orange", onClick: () => this.chooseFirst(c.id) },
          ],
        });
      };
      list.appendChild(card);
    });
    this.show("first");
  },

  chooseFirst(id) {
    Store.data.characters = [id];
    Store.data.partner = id;
    Store.save();
    Sound.fanfare();
    this.goHome();
    this.checkLoginBonus();
  },

  // ---------- ホーム ----------
  goHome() {
    this.renderHomeChara();
    $("#home-streak").textContent = Store.data.loginStreak
      ? `れんぞく ${Store.data.loginStreak}日め`
      : "";
    this.renderSoundButton();
    this.show("home");
  },

  switchPartner(dir) {
    const ids = Store.data.characters;
    if (ids.length < 2) return;
    Sound.tap();
    const i = ids.indexOf(Store.data.partner);
    Store.data.partner = ids[(i + dir + ids.length) % ids.length];
    Store.save();
    const chara = this.renderHomeChara();
    chara.classList.add("jump");
    setTimeout(() => chara.classList.remove("jump"), 1200);
  },

  renderHomeChara() {
    const partner = Store.data.partner;
    const c = getCharacter(partner);
    const multi = Store.data.characters.length > 1;
    $("#home-prev").hidden = !multi;
    $("#home-next").hidden = !multi;
    $("#home-partner-name").textContent = `★ あいぼう：${c.name}`;
    const stage = $("#home-chara");
    stage.innerHTML = "";
    const chara = renderCharacter(partner, "normal", { className: "home-chara" });
    chara.onclick = () => {
      Sound.correct();
      setCharacterMood(chara, "happy");
      chara.classList.add("jump");
      setTimeout(() => {
        setCharacterMood(chara, "normal");
        chara.classList.remove("jump");
      }, 1200);
    };
    stage.appendChild(chara);

    const lines = [
      "きょうも いっしょに がんばろう！",
      "べんきょうして ポイントを ためよう！",
      "あたらしい かぐが ほしいなあ。",
      "おうちを 大きく したいね！",
      "れんぞく せいかいで ポイント アップ！",
    ];
    $("#home-talk").textContent = lines[Math.floor(Math.random() * lines.length)];
    return chara;
  },

  checkLoginBonus() {
    const today = todayString();
    if (Store.data.lastLogin === today) return;
    const yesterday = todayString(new Date(Date.now() - 86400000));
    Store.data.loginStreak = Store.data.lastLogin === yesterday ? Store.data.loginStreak + 1 : 1;
    Store.data.lastLogin = today;
    const bonus = loginBonusFor(Store.data.loginStreak);
    Store.addPoints(bonus);
    this.goHome();
    showModal({
      title: "まいにち ボーナス！",
      body: `れんぞく ${Store.data.loginStreak}日め！ ${bonus} てん プレゼント！`,
      image: renderCharacter(Store.data.partner, "happy", { className: "modal-chara" }),
      buttons: [{ label: "やったー！", onClick: () => Sound.buy() }],
    });
  },

  registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  },
};

window.addEventListener("DOMContentLoaded", () => App.init());
