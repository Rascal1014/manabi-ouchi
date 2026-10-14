function $(sel, root = document) {
  return root.querySelector(sel);
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPoints(n) {
  return n.toLocaleString("ja-JP");
}

// ---- 効果音（音声ファイルなしで WebAudio で鳴らす） ----
const Sound = {
  ctx: null,

  play(notes) {
    if (!Store.data.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const now = this.ctx.currentTime;
      notes.forEach(([freq, start, dur, type = "triangle"]) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch (e) {
      // 音が鳴らせない環境では何もしない
    }
  },

  tap() { this.play([[660, 0, 0.08]]); },
  correct() { this.play([[784, 0, 0.12], [1047, 0.1, 0.25]]); },
  wrong() { this.play([[330, 0, 0.18, "sawtooth"], [247, 0.15, 0.3, "sawtooth"]]); },
  combo() { this.play([[784, 0, 0.1], [988, 0.08, 0.1], [1175, 0.16, 0.1], [1568, 0.24, 0.3]]); },
  buy() { this.play([[1047, 0, 0.1], [1319, 0.08, 0.1], [1568, 0.16, 0.25]]); },
  fanfare() {
    this.play([
      [523, 0, 0.15], [659, 0.15, 0.15], [784, 0.3, 0.15], [1047, 0.45, 0.5],
      [784, 0.8, 0.12], [1047, 0.95, 0.7],
    ]);
  },
};

// ---- キャラクター（きせかえ込み）を描く ----
function renderCharacter(charId, mood = "normal", options = {}) {
  const wrap = el("div", "chara" + (options.className ? " " + options.className : ""));
  wrap.dataset.char = charId;
  const img = el("img", "chara-img");
  img.src = bodyImg(charId, mood);
  img.alt = getCharacter(charId).name;
  img.draggable = false;
  wrap.appendChild(img);
  addWear(wrap, charId, mood);
  return wrap;
}

function setCharacterMood(wrap, mood) {
  const img = wrap.querySelector(".chara-img");
  img.src = bodyImg(wrap.dataset.char, mood);
  addWear(wrap, wrap.dataset.char, mood);
}

// きせかえを重ねる。画像の服は「着た絵」をキャラ本体の絵にするので、ここでは バッグと あたまの こものだけ重ねる
function addWear(wrap, charId, mood) {
  wrap.querySelectorAll(".wear").forEach((n) => n.remove());
  const fit = getCharacter(charId).fit;
  const f = fit && (fit[mood] || fit.normal);
  const outfit = Store.data.outfits[charId] || {};
  const get = (slot) => outfit[slot] && getItem(outfit[slot]);
  const clothes = get("clothes");
  // うしろ姿のときは、こものも うしろから見た絵にする
  const back = mood.startsWith("walkb");
  const view = (item) => (back && item.image ? { ...item, image: backImageOf(item.image) } : item);

  // 絵文字の服（着た絵がないもの）だけは、今までどおり重ねる
  if (clothes && !clothes.image) {
    wrap.appendChild(renderItemVisual(clothes, `wear wear-clothes mood-${mood}`));
  }

  const bag = get("bag");
  const hold = bag && bag.wear && bag.wear.hold;
  // りょう手で かかえる ものは、うしろ姿では 体に かくれて 見えない
  if (bag && !(back && hold === "both")) {
    // せおう ものは、前からは かたひもだけ、うしろからは 本体を 見せる
    const shown = hold === "back" && !back ? { ...bag, image: bag.wear.front } : bag;
    const node = renderItemVisual(shown, `wear wear-bag mood-${mood}`);
    fitWear(node, "bag", bag.image && bag.wear, f, back);
    wrap.appendChild(node);
  }

  // あたまの こものを えらんでいれば それを、なければ ナース服などの セットの ぼうしを かぶる
  const set = clothes && clothes.wear && clothes.wear.head;
  const head = get("head") || (set && { image: set.image, name: clothes.name, wear: set });
  if (head) {
    const node = renderItemVisual(view(head), `wear wear-head mood-${mood}`);
    fitWear(node, "head", head.image && head.wear, f, back);
    wrap.appendChild(node);
  }
}

// 画像の服・こものを、キャラの体の位置と大きさに合わせる（絵文字のものは CSS の位置のまま）
function fitWear(node, slot, w, f, back = false) {
  if (!w || !f) return;
  const s = node.style;
  if (slot === "head") {
    s.width = f.headW * w.w + "%";
    // かたよせて つける リボンなどは、うしろから見ると 左右が 逆になる
    s.left = f.headX + (w.x || 0) * (back ? -1 : 1) * f.headW + "%";
    s.top = f.headTop + (w.y || 0) + "%";
    s.transform = "translate(-50%, -100%)";
  } else if (w.hold === "back") {
    // 前は かたひもを むねに、うしろは 本体を せなかの まん中に
    s.width = (back ? w.w : f.bodyW * 0.8) + "%";
    if (!back) s.height = "22%";
    s.left = f.bodyX + "%";
    s.top = f.neck - (back ? 3 : 1) + "%";
    s.transform = "translate(-50%, 0)";
  } else if (w.hold === "both") {
    s.width = w.w + "%";
    s.left = f.bodyX + "%";
    s.top = f.neck + 14 + "%";
    s.transform = "translate(-50%, -50%)";
  } else if (w.hold === "shoulder") {
    // かたひもの上のはしを かたに かけて、体の よこに さげる
    s.width = w.w + "%";
    s.left = f.bodyX + f.bodyW * 0.38 + "%";
    s.top = f.neck + 1 + "%";
    s.transform = "translate(-50%, 0)";
  } else {
    // hand・pull: 絵の (ax, ay) の ところを 手の位置に あわせる
    s.width = w.w + "%";
    s.left = f.handX + "%";
    s.top = f.handY + "%";
    s.transform = `translate(${-(w.ax ?? 0.5) * 100}%, ${-(w.ay ?? 0.1) * 100}%)`;
  }
}

function renderItemVisual(item, className = "") {
  if (item.image) {
    const img = el("img", "item-visual " + className);
    img.src = item.image;
    img.alt = item.name;
    img.draggable = false;
    return img;
  }
  return el("span", "item-visual " + className, item.icon);
}

// ---- 演出 ----
function confetti(container, count = 80) {
  const colors = ["#f0a35e", "#7fae6b", "#f4b6a6", "#8fb8d8", "#f6d36b", "#c49bd6"];
  for (let i = 0; i < count; i++) {
    const p = el("div", "confetti");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 1.2 + "s";
    p.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(p);
  }
}

function toast(message) {
  const t = el("div", "toast", message);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 2000);
}

function showModal({ title, body, image, buttons }) {
  const overlay = el("div", "modal-overlay");
  const box = el("div", "modal");
  if (image) box.appendChild(image);
  if (title) box.appendChild(el("h2", "modal-title", title));
  if (body) box.appendChild(el("p", "modal-body", body));
  const row = el("div", "modal-buttons");
  (buttons || [{ label: "OK" }]).forEach((b) => {
    const btn = el("button", "btn " + (b.className || "btn-orange"), b.label);
    btn.onclick = () => {
      overlay.remove();
      if (b.onClick) b.onClick();
    };
    row.appendChild(btn);
  });
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
