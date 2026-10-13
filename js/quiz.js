const COURSES = [10, 20, 30];

const Quiz = {
  packId: null,
  course: 10,
  level: "normal",
  questions: [],
  index: 0,
  streak: 0,
  maxStreak: 0,
  correctCount: 0,
  breakdown: null,
  answered: false,

  // ---------- コース選択 ----------
  openCourseSelect() {
    const pack = getPack(this.packId || (window.PACKS[0] && window.PACKS[0].id));
    this.packId = pack.id;
    $("#course-pack-title").textContent = pack.title;

    const packRow = $("#pack-select");
    packRow.innerHTML = "";
    packRow.hidden = window.PACKS.length < 2;
    window.PACKS.forEach((p) => {
      const b = el("button", "chip" + (p.id === this.packId ? " active" : ""), p.title);
      b.onclick = () => {
        Sound.tap();
        this.packId = p.id;
        this.openCourseSelect();
      };
      packRow.appendChild(b);
    });

    const courseRow = $("#course-select");
    courseRow.innerHTML = "";
    COURSES.forEach((n) => {
      const b = el("button", "chip big" + (n === this.course ? " active" : ""), `${n}もん`);
      b.onclick = () => {
        Sound.tap();
        this.course = n;
        this.openCourseSelect();
      };
      courseRow.appendChild(b);
    });

    const levelRow = $("#level-select");
    levelRow.innerHTML = "";
    Object.keys(LEVEL_NAMES).forEach((lv) => {
      const b = el("button", `chip big level-${lv}` + (lv === this.level ? " active" : ""), LEVEL_NAMES[lv]);
      b.onclick = () => {
        Sound.tap();
        this.level = lv;
        this.openCourseSelect();
      };
      levelRow.appendChild(b);
    });

    $("#course-highscore").textContent =
      `ハイスコア：${formatPoints(getHighScore(this.packId, this.course, this.level))} てん`;
    App.show("course");
  },

  // ---------- 出題 ----------
  start() {
    const pack = getPack(this.packId);
    this.questions = this.pickQuestions(pack, this.level, this.course);
    this.index = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.breakdown = { base: 0, combo: 0, level: 0, perfect: 0 };
    // パーフェクトのときに すぐ出せるように、とくべつな絵を えらんで 先に読みこんでおく
    this.special = SPECIAL_ARTS[Math.floor(Math.random() * SPECIAL_ARTS.length)];
    new Image().src = this.special.image;
    App.show("quiz");
    this.renderQuestion();
  },

  // 1回のプレイでは同じ問題を出さない。苦手な問題と、まだ出ていない問題を優先する。
  pickQuestions(pack, level, count) {
    const all = pack.questions.filter((q) => q.level === level);
    const seenKey = `${pack.id}_${level}`;
    const seen = new Set(Store.data.seen[seenKey] || []);
    const wrong = new Set(Store.data.wrong[pack.id] || []);

    const weak = shuffle(all.filter((q) => wrong.has(q.id))).slice(0, Math.floor(count / 3));
    const rest = all.filter((q) => !weak.includes(q));
    const unseen = shuffle(rest.filter((q) => !seen.has(q.id)));

    let chosen = weak.concat(unseen.slice(0, count - weak.length));
    let seenList = [...seen];
    if (chosen.length < count) {
      // まだ出ていない問題を出し切ったら、記録をリセットして続ける
      const others = shuffle(rest.filter((q) => !chosen.includes(q)));
      chosen = chosen.concat(others.slice(0, count - chosen.length));
      seenList = [];
    }
    Store.data.seen[seenKey] = seenList.concat(chosen.map((q) => q.id));
    Store.save();

    return this.mixAnswers(shuffle(chosen));
  },

  // 同じ答えが3問以上続かないように並べかえる
  mixAnswers(list) {
    const a = list.slice();
    for (let i = 2; i < a.length; i++) {
      if (a[i].answer === a[i - 1].answer && a[i].answer === a[i - 2].answer) {
        const j = a.findIndex((q, k) => k > i && q.answer !== a[i].answer);
        if (j > -1) [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return a;
  },

  renderQuestion() {
    const pack = getPack(this.packId);
    const q = this.questions[this.index];
    this.answered = false;

    $("#quiz-progress").textContent = `${this.index + 1} / ${this.questions.length}`;
    $("#quiz-progress-bar").style.width = `${(this.index / this.questions.length) * 100}%`;
    this.renderCombo();

    const stage = $("#quiz-chara");
    stage.innerHTML = "";
    stage.appendChild(renderCharacter(Store.data.partner, "normal"));

    $("#quiz-prompt").textContent = q.prompt || pack.prompt || "";
    $("#quiz-text").textContent = q.text;
    $("#quiz-feedback").hidden = true;

    const choices = q.choices || pack.choices;
    const box = $("#quiz-choices");
    box.innerHTML = "";
    choices.forEach((label, i) => {
      const b = el("button", `choice choice-${i}`, label);
      b.onclick = () => this.answer(i, b);
      box.appendChild(b);
    });
  },

  renderCombo() {
    const mult = comboMultiplier(this.streak);
    $("#quiz-combo").innerHTML = "";
    if (this.streak >= 2) {
      $("#quiz-combo").append(
        el("span", "combo-count", `${this.streak}れんぞく`),
        el("span", "combo-mult", `×${mult}`)
      );
    }
    $("#quiz-score").textContent = `${formatPoints(this.currentScore())} てん`;
  },

  currentScore() {
    const b = this.breakdown;
    return b.base + b.combo + b.level + b.perfect;
  },

  answer(choiceIndex, button) {
    if (this.answered) return;
    this.answered = true;
    const pack = getPack(this.packId);
    const q = this.questions[this.index];
    const ok = choiceIndex === q.answer;
    const chara = $("#quiz-chara .chara");
    const buttons = [...document.querySelectorAll("#quiz-choices .choice")];
    buttons.forEach((b) => (b.disabled = true));
    buttons[q.answer].classList.add("is-answer");

    const wrongList = new Set(Store.data.wrong[pack.id] || []);
    let gained = 0;
    let s = null;
    if (ok) {
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      this.correctCount++;
      s = scoreForCorrect(this.streak, this.level);
      this.breakdown.base += s.base;
      this.breakdown.combo += s.combo;
      this.breakdown.level += s.level;
      gained = s.total;
      wrongList.delete(q.id);
      setCharacterMood(chara, "happy");
      chara.classList.add("jump");
      if (this.streak % SCORE.comboStep === 0) {
        Sound.combo();
        this.showComboBurst();
      } else {
        Sound.correct();
      }
    } else {
      this.streak = 0;
      wrongList.add(q.id);
      button.classList.add("is-wrong");
      setCharacterMood(chara, "cry");
      chara.classList.add("shake");
      Sound.wrong();
    }
    Store.data.wrong[pack.id] = [...wrongList];
    Store.save();
    this.renderCombo();

    const fb = $("#quiz-feedback");
    fb.className = "feedback " + (ok ? "ok" : "ng");
    $("#feedback-mark").textContent = ok ? "せいかい！" : "ざんねん…";
    this.renderGained(ok ? s : null);
    $("#feedback-explain").textContent = q.explain || "";
    $("#feedback-next").textContent =
      this.index + 1 < this.questions.length ? "つぎへ" : "おわり！";
    fb.hidden = false;
  },

  // 倍率がかかったときは、かけざんの内訳と大きな数字で目立たせる
  renderGained(s) {
    const box = $("#feedback-points");
    box.innerHTML = "";
    box.className = "feedback-points";
    if (!s) return;
    const combo = comboMultiplier(this.streak);
    const level = SCORE.levelMultiplier[this.level];
    const boosted = combo > 1 || level > 1;

    if (boosted) {
      box.classList.add("boosted");
      const calc = el("div", "gain-calc");
      calc.appendChild(el("span", "gain-base", `${s.base}てん`));
      if (combo > 1) calc.appendChild(el("span", "gain-chip combo", `コンボ ×${combo}`));
      if (level > 1) calc.appendChild(el("span", "gain-chip hard", `むずかしい ×${level}`));
      box.appendChild(calc);
    }
    box.appendChild(el("div", "gain-total", `+${s.total} てん`));

    const score = $("#quiz-score");
    score.classList.remove("bump");
    void score.offsetWidth;
    score.classList.add("bump");
    const pop = el("div", "score-pop" + (boosted ? " boosted" : ""), `+${s.total}`);
    score.appendChild(pop);
    setTimeout(() => pop.remove(), 1300);
  },

  showComboBurst() {
    const burst = el("div", "combo-burst", `${this.streak}れんぞく コンボ！ ×${comboMultiplier(this.streak)}`);
    $("#screen-quiz").appendChild(burst);
    setTimeout(() => burst.remove(), 1600);
  },

  next() {
    Sound.tap();
    this.index++;
    if (this.index < this.questions.length) {
      this.renderQuestion();
    } else {
      this.finish();
    }
  },

  quit() {
    showModal({
      title: "やめる？",
      body: "ここまでの ポイントは もらえないよ。",
      buttons: [
        { label: "つづける", className: "btn-green" },
        { label: "やめる", className: "btn-gray", onClick: () => App.goHome() },
      ],
    });
  },

  // ---------- クリア・結果 ----------
  finish() {
    const perfect = this.correctCount === this.questions.length;
    if (perfect) this.breakdown.perfect = perfectBonus(this.currentScore());
    const total = this.currentScore();
    Store.addPoints(total);
    this.isNewRecord = updateHighScore(this.packId, this.course, this.level, total);

    const screen = $("#screen-clear");
    screen.classList.toggle("perfect", perfect);
    $("#clear-title").textContent = perfect ? "パーフェクト！" : "クリア！";
    $("#clear-sub").textContent = perfect
      ? `ぜんもん せいかい！ てんすう ぜんぶ ×${SCORE.perfectRate}！`
      : `${this.questions.length}もん さいごまで がんばったね！`;
    const stage = $("#clear-chara");
    stage.innerHTML = "";
    Store.data.characters.forEach((id) => {
      stage.appendChild(renderCharacter(id, "happy", { className: "jump-loop" }));
    });
    const fx = $("#clear-confetti");
    fx.innerHTML = "";
    confetti(fx, perfect ? 140 : 80);
    App.show("clear");
    Sound.fanfare();
    if (perfect) setTimeout(() => this.showSpecial(), 1400);
  },

  // パーフェクトの ごほうび。3人の とくべつな絵を 画面いっぱいに出す
  showSpecial() {
    if (document.body.dataset.screen !== "clear") return;
    const art = this.special;
    const overlay = el("div", "special-art");
    const frame = el("div", "special-frame");
    const img = el("img", "special-img");
    img.src = art.image;
    img.alt = art.title;
    frame.append(el("div", "special-badge", "パーフェクト ごほうび"), img, el("div", "special-title", art.title));
    const fx = el("div", "special-fx");
    overlay.append(fx, frame, el("div", "special-hint", "タップで とじる"));
    confetti(fx, 60);
    overlay.onclick = () => {
      Sound.tap();
      overlay.classList.add("closing");
      setTimeout(() => overlay.remove(), 300);
    };
    document.body.appendChild(overlay);
    Sound.combo();
  },

  showResult() {
    Sound.tap();
    const b = this.breakdown;
    $("#result-summary").textContent =
      `${this.questions.length}もん中 ${this.correctCount}もん せいかい（${LEVEL_NAMES[this.level]}）`;
    const rows = [
      ["せいかいの てん", b.base],
      [`コンボボーナス（さいだい ${this.maxStreak}れんぞく）`, b.combo],
      ["むずかしいボーナス", b.level],
      [`パーフェクトボーナス（ぜんぶ ×${SCORE.perfectRate}）`, b.perfect],
    ];
    const table = $("#result-table");
    table.innerHTML = "";
    rows.forEach(([label, value]) => {
      if (label.startsWith("むずかしい") && this.level !== "hard") return;
      const row = el("div", "result-row");
      row.append(el("span", "", label), el("span", "result-value", `+${formatPoints(value)}`));
      table.appendChild(row);
    });
    $("#result-total").textContent = `${formatPoints(this.currentScore())} てん ゲット！`;
    $("#result-record").hidden = !this.isNewRecord;
    $("#result-points").textContent = `もっている ポイント：${formatPoints(Store.data.points)}`;
    App.show("result");
  },
};
