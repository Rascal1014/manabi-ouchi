// 問題パックの登録。パックのファイルは index.html で読み込む。
window.PACKS = [];

function registerPack(pack) {
  window.PACKS.push(pack);
}

function getPack(id) {
  return window.PACKS.find((p) => p.id === id) || window.PACKS[0];
}
