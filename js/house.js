// 家具ぜんたいの大きさ（shop.js の size に かける）。キャラより少し大きいくらいに見せる
const FURNITURE_SCALE = 1.8;

const House = {
  area: "1f",
  selected: null, // 選んでいる家具の uid

  open() {
    const house = getHouse(Store.data.house);
    const areas = Object.keys(house.rooms);
    if (!house.rooms[this.area]) this.area = areas[0];
    // ひっこし先に ない へやに おいていた かぐは、さいしょの へやに うつす
    let moved = false;
    Store.data.placements.forEach((p) => {
      if (!house.rooms[p.area]) {
        p.area = areas[0];
        moved = true;
      }
    });
    if (moved) Store.save();
    this.selected = null;
    // きせかえを変えたかもしれないので、キャラを作りなおす
    this.version++;
    this.render();
    App.show("house");
  },

  render() {
    const house = getHouse(Store.data.house);
    $("#house-name").textContent = house.name;
    $("#house-count").textContent = `かぐ ${Store.data.placements.length} / ${house.maxItems}`;

    const tabs = $("#house-areas");
    tabs.innerHTML = "";
    const areas = Object.keys(house.rooms);
    tabs.hidden = areas.length < 2;
    areas.forEach((a) => {
      const b = el("button", "tab" + (a === this.area ? " active" : ""), areaName(house, a));
      b.onclick = () => {
        Sound.tap();
        this.area = a;
        this.selected = null;
        this.render();
      };
      tabs.appendChild(b);
    });

    this.renderRoom(house);
    this.renderInventory(house);
    $("#house-remove").hidden = !this.selected;
  },

  renderRoom(house) {
    const room = $("#room");
    // 家具を動かしただけのときは、歩いているキャラはそのまま続ける
    const key = `${house.id}/${this.area}/${Store.data.characters.join(",")}/${this.version}`;
    if (room.dataset.key !== key) {
      room.innerHTML = "";
      room.dataset.key = key;
      this.walkers = [];
    } else {
      room.querySelectorAll(".placed").forEach((n) => n.remove());
    }
    if (!room.dataset.furnitureFirst) {
      room.dataset.furnitureFirst = "1";
      // キャラと 家具が かさなったところを おしたら 家具を うごかす（家具どうしは 手前のもの）
      room.addEventListener("pointerdown", (e) => {
        if (!e.target.closest(".walker")) return;
        const under = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.classList.contains("placed"));
        if (!under) return;
        e.stopPropagation();
        e.preventDefault();
        under.dispatchEvent(new PointerEvent("pointerdown", e));
      }, true);
    }
    room.className = `room area-${this.area}`;
    room.style.backgroundImage = `url("${house.rooms[this.area]}")`;
    const floor = this.floor(house);

    Store.data.placements
      .filter((p) => p.area === this.area)
      .forEach((p) => {
        const item = getItem(p.item);
        if (!item) return;
        const node = renderItemVisual(item, "placed" + (p.uid === this.selected ? " selected" : ""));
        node.style.setProperty("--size", (item.size || 14) * FURNITURE_SCALE);
        this.placeFurniture(node, p, floor);
        this.makeDraggable(node, p, floor);
        room.appendChild(node);
      });

    if (!this.walkers.length) {
      const ids = Store.data.characters;
      ids.forEach((id, i) => {
        // 横にばらけるように、最初は床を等分した位置から歩きはじめる
        const x = floor.left + ((i + 0.5) / ids.length) * (floor.right - floor.left);
        const y = floor.top + (0.45 + Math.random() * 0.4) * (floor.bottom - floor.top);
        const w = this.makeWalker(id, x, y, i);
        this.walkers.push(w);
        room.appendChild(w.node);
      });
      this.floorNow = floor;
      this.nextTalk = performance.now() + 2500 + Math.random() * 3000;
    }
    this.startLoop();
  },

  floor(house) {
    return FLOORS[house.rooms[this.area]] || { left: 12, right: 88, top: 55, bottom: 95 };
  },

  // 奥（床の上のほう）ほど小さく、手前ほど大きく見せる
  depthScale(y, floor) {
    const d = Math.max(0, Math.min(1, (y - floor.top) / (floor.bottom - floor.top)));
    return 0.72 + d * 0.38;
  },

  // 家具は足もと（下のはし）が p.x, p.y
  placeFurniture(node, p, floor) {
    node.style.left = p.x + "%";
    node.style.top = p.y + "%";
    node.style.setProperty("--depth", this.depthScale(p.y, floor).toFixed(3));
    node.style.zIndex = Math.round(p.y);
  },

  // ---------- キャラが部屋を歩く ----------
  walkers: [],
  raf: null,
  version: 0,

  makeWalker(id, x, y, i) {
    const node = el("div", "walker");
    const flip = el("div", "walker-flip");
    // ポーズごとの絵を はじめに全部 重ねて作っておき、見せる1まいを切りかえる
    // （歩くたびに 画像と服を作りなおすと、読みこみの あいだ 一瞬 消えて ちらつく）
    const chara = el("div", "pose-stack room-chara");
    const poses = {};
    // 服を着ているときは 足がそろう コマ（walkf2・walkb2）を使わない
    const dressed = !!wornClothes(id);
    const cycle = dressed ? DRESSED_WALK_CYCLE : WALK_CYCLE;
    const walkPoses = dressed ? WALK_POSES.filter((p) => !p.endsWith("2")) : WALK_POSES;
    ["normal", "happy", ...walkPoses].forEach((pose) => {
      poses[pose] = renderCharacter(id, pose);
      chara.appendChild(poses[pose]);
    });
    poses.normal.classList.add("on");
    const bubble = el("div", "bubble");
    flip.appendChild(chara);
    node.append(flip, bubble);

    const w = {
      id, node, flip, chara, poses, cycle, bubble, x, y,
      tx: x, ty: y, speed: 0,
      state: "idle", wait: 0.8 + i * 1.1 + Math.random(), hopAt: 0, busyUntil: 0, talkUntil: 0,
      pose: "normal", view: "walkf", beat: 0, beatDist: 0,
    };
    chara.onclick = () => this.tapWalker(w);
    return w;
  },

  startLoop() {
    if (this.raf) return;
    let last = performance.now();
    const tick = (now) => {
      const room = $("#room");
      if (document.body.dataset.screen !== "house" || !room.isConnected) {
        this.raf = null;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.walkers.forEach((w) => this.updateWalker(w, dt, now));
      if (now > this.nextTalk && this.walkers.length) {
        const free = this.walkers.filter((w) => now > w.talkUntil && w.state !== "busy");
        if (free.length) this.say(free[Math.floor(Math.random() * free.length)], now);
        this.nextTalk = now + 6000 + Math.random() * 6000;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },

  updateWalker(w, dt, now) {
    const floor = this.floorNow;
    const MAX = 10; // 1びょうに進む距離（部屋の幅に対する %）
    const STRIDE = 2.2; // この距離を進むごとに 歩きの絵を 1コマ進める（足がすべって見えないように）

    if (w.state === "busy" && now > w.busyUntil) {
      this.setPose(w, "normal");
      w.state = "idle";
      w.wait = 0.6;
    }
    if (w.state === "idle") {
      w.wait -= dt;
      if (w.wait <= 0) {
        w.tx = floor.left + Math.random() * (floor.right - floor.left);
        w.ty = floor.top + Math.random() * (floor.bottom - floor.top);
        w.state = "walk";
        w.beat = 0;
        w.beatDist = 0;
        // 奥へ向かうときは うしろ姿、手前や横へは 前向き。ほぼ真横のときは 前の向きのまま
        const dirY = (w.ty - w.y) * 1.4 / (Math.hypot(w.tx - w.x, (w.ty - w.y) * 1.4) || 1);
        if (dirY < -0.3) w.view = "walkb";
        else if (dirY > -0.1) w.view = "walkf";
      }
    }

    // 目的地に向かって、ゆっくり加速して、着く前にゆっくり止まる
    const dx = w.tx - w.x;
    const dy = (w.ty - w.y) * 1.4;
    const dist = Math.hypot(dx, dy);
    const want = w.state === "walk" ? MAX * Math.min(1, dist / 6 + 0.15) : 0;
    w.speed += (want - w.speed) * Math.min(1, dt * 4);
    if (w.state === "walk") {
      if (dist < 0.4) {
        w.state = "idle";
        w.wait = 1.2 + Math.random() * 2.8;
        this.setPose(w, "normal");
        if (Math.random() < 0.2) w.hopAt = now;
      } else {
        const step = Math.min(dist, w.speed * dt);
        w.x += (dx / dist) * step;
        w.y += (dy / dist / 1.4) * step;
        if (Math.abs(dx) > 1.5) w.flip.classList.toggle("left", dx < 0);
        w.beatDist += step;
        if (w.beatDist >= STRIDE) {
          w.beatDist -= STRIDE;
          w.beat = (w.beat + 1) % w.cycle.length;
        }
        this.setPose(w, w.view + w.cycle[w.beat]);
      }
    }

    // ゆれは控えめに。足がそろうコマ（2）で少し体が上がり、4コマで左右に1往復かたむく
    const a = w.state === "walk" ? Math.min(1, w.speed / MAX) : 0;
    const p = w.beat + w.beatDist / STRIDE;
    let lift = -((1 - Math.cos(p * Math.PI)) / 2) * 1.5 * a;
    let tilt = Math.sin((p * Math.PI) / 2) * 2 * a;
    let sx = 1 + Math.sin(now / 420) * 0.012 * (1 - a);
    let sy = 1 - Math.sin(now / 420) * 0.015 * (1 - a);

    // ぴょんとジャンプ
    if (w.hopAt) {
      const p = (now - w.hopAt) / 650;
      if (p >= 1) {
        w.hopAt = 0;
      } else {
        lift += -Math.sin(Math.PI * p) * 18;
        const squash = p < 0.12 ? (0.12 - p) * 1.2 : p > 0.88 ? (p - 0.88) * 1.2 : 0;
        sx += squash;
        sy -= squash;
      }
    }

    w.chara.style.transform = `translateY(${lift.toFixed(2)}%) rotate(${tilt.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    const n = w.node.style;
    n.left = w.x.toFixed(2) + "%";
    n.top = w.y.toFixed(2) + "%";
    n.setProperty("--depth", this.depthScale(w.y, floor).toFixed(3));
    // しゃべっている間は、ふきだしが かくれないように前に出す
    n.zIndex = Math.round(w.y) + (now < w.talkUntil ? 100 : 0);
  },

  tapWalker(w) {
    if (w.state === "busy") return;
    const now = performance.now();
    Sound.correct();
    w.state = "busy";
    w.busyUntil = now + 1400;
    w.hopAt = now;
    this.setPose(w, "happy");
    this.say(w, now);
  },

  setPose(w, pose) {
    if (w.pose === pose) return;
    w.poses[w.pose].classList.remove("on");
    w.poses[pose].classList.add("on");
    w.pose = pose;
  },

  say(w, now) {
    const b = w.bubble;
    b.textContent = TALK_LINES[Math.floor(Math.random() * TALK_LINES.length)];
    // 部屋のはしでは ふきだしが はみ出さないように よせる
    b.classList.toggle("edge-left", w.x < 30);
    b.classList.toggle("edge-right", w.x > 70);
    b.classList.remove("show");
    void b.offsetWidth;
    b.classList.add("show");
    w.talkUntil = now + 2800;
    clearTimeout(w.talkTimer);
    w.talkTimer = setTimeout(() => b.classList.remove("show"), 2800);
  },

  renderInventory(house) {
    const inv = $("#house-inventory");
    inv.innerHTML = "";
    const placedIds = Store.data.placements.map((p) => p.item);
    const stock = Store.data.owned
      .map(getItem)
      .filter((i) => i && i.category === "furniture" && !placedIds.includes(i.id));
    if (!stock.length) {
      inv.appendChild(el("div", "inventory-empty", "おく かぐが ないよ。ショップで かってね！"));
      return;
    }
    stock.forEach((item) => {
      const b = el("button", "inventory-item");
      b.appendChild(renderItemVisual(item));
      b.appendChild(el("span", "inventory-name", item.name));
      b.onclick = () => this.place(item, house);
      inv.appendChild(b);
    });
  },

  place(item, house) {
    if (Store.data.placements.length >= house.maxItems) {
      Sound.wrong();
      toast("もう おけないよ。おうちを 大きく しよう！");
      return;
    }
    Sound.tap();
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const f = this.floor(house);
    const x = f.left + Math.random() * (f.right - f.left);
    const y = f.top + 4 + Math.random() * (f.bottom - f.top - 14);
    Store.data.placements.push({ uid, item: item.id, area: this.area, x, y });
    Store.save();
    this.selected = uid;
    this.render();
  },

  removeSelected() {
    Sound.tap();
    Store.data.placements = Store.data.placements.filter((p) => p.uid !== this.selected);
    Store.save();
    this.selected = null;
    this.render();
  },

  // タップで選ぶ、ドラッグで動かす
  makeDraggable(node, placement, floor) {
    node.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const room = $("#room");
      const rect = room.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      node.setPointerCapture(e.pointerId);

      const onMove = (ev) => {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 6) moved = true;
        if (!moved) return;
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        placement.x = Math.max(0, Math.min(100, x));
        placement.y = Math.max(0, Math.min(100, y));
        this.placeFurniture(node, placement, floor);
        node.style.zIndex = 200;
      };
      const onUp = () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerup", onUp);
        node.removeEventListener("pointercancel", onUp);
        Store.save();
        this.selected = moved ? placement.uid : this.selected === placement.uid ? null : placement.uid;
        this.render();
      };
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerup", onUp);
      node.addEventListener("pointercancel", onUp);
    });
  },
};
