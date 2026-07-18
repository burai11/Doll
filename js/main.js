/**
 * main.js
 * アプリの初期化を担当する。
 */
(async () => {
  const loadingEl = document.getElementById("loading");
  const canvas = document.getElementById("character-canvas");

  try {
    // キャラクター一覧からデフォルトキャラクターを決定
    const list = await DataLoader.loadJSON("characters/characters.json");
    const entry =
      list.characters.find((c) => c.id === list.default) ?? list.characters[0];

    // キャラクター一式を読み込み
    const character = await DataLoader.loadCharacter(entry.path);

    // 各モジュールを初期化
    Renderer.init(canvas, character);
    Studio.init(canvas);
    Wardrobe.init(character, (selections) => Renderer.render(selections));

    // 初回描画
    await Renderer.render(Wardrobe.getSelections());

    loadingEl.classList.add("hidden");
  } catch (err) {
    console.error(err);
    loadingEl.classList.add("error");
    loadingEl.textContent =
      "読み込みに失敗しました。\n" +
      "ローカルで開く場合はサーバー経由で起動してください。\n" +
      "（詳細はREADME.mdを参照）";
  }
})();
