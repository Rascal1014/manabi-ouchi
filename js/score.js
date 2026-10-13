// ポイントの数値はここで調整する
const SCORE = {
  base: 10, // 1問正解の基本点
  comboStep: 5, // 何問連続ごとに倍率が上がるか
  comboAdd: 1, // 1回で上がる倍率（5問で×2、10問で×3…上限なし）
  levelMultiplier: { normal: 1, hard: 1.5 },
  perfectRate: 2, // パーフェクトなら、その回の得点ぜんぶがこの倍率になる
  loginBonus: 30, // 毎日ボーナス（連続日数で増える）
  loginBonusStep: 10,
  loginBonusMaxDays: 7,
};

const LEVEL_NAMES = { normal: "ふつう", hard: "むずかしい" };

// streak: この問題をふくめた連続正解数
function comboMultiplier(streak) {
  const steps = Math.floor(streak / SCORE.comboStep);
  return 1 + steps * SCORE.comboAdd;
}

// 1問ぶんの点を「基本・コンボ・むずかしい」に分けて返す
function scoreForCorrect(streak, level) {
  const withCombo = Math.round(SCORE.base * comboMultiplier(streak));
  const total = Math.round(withCombo * SCORE.levelMultiplier[level]);
  return {
    base: SCORE.base,
    combo: withCombo - SCORE.base,
    level: total - withCombo,
    total,
  };
}

// パーフェクトで ふえる ぶん（その回の得点 × (perfectRate - 1)）
function perfectBonus(subtotal) {
  return Math.round(subtotal * (SCORE.perfectRate - 1));
}

function highScoreKey(packId, course, level) {
  return `${packId}_${course}_${level}`;
}

function getHighScore(packId, course, level) {
  return Store.data.highScores[highScoreKey(packId, course, level)] || 0;
}

// 更新したら true
function updateHighScore(packId, course, level, score) {
  const key = highScoreKey(packId, course, level);
  if (score > (Store.data.highScores[key] || 0)) {
    Store.data.highScores[key] = score;
    Store.save();
    return true;
  }
  return false;
}

function loginBonusFor(streak) {
  const days = Math.min(streak, SCORE.loginBonusMaxDays);
  return SCORE.loginBonus + (days - 1) * SCORE.loginBonusStep;
}
