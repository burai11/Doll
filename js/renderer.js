/**
 * renderer.js
 * キャラクターのレイヤー描画を担当する。
 * 表示・非表示の制御は行わず、選択された画像をすべてレイヤー順に描画する。
 */
const Renderer = (() => {
  let canvas = null;
  let ctx = null;
  let character = null; // { def, items, basePath }
  let categoryOrder = new Map(); // 同一レイヤー内の描画順（カテゴリ定義順）

  function init(canvasEl, characterData) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    character = characterData;

    canvas.width = character.def.canvas.width;
    canvas.height = character.def.canvas.height;

    categoryOrder = new Map(
      character.def.categories.map((c, i) => [c.id, i])
    );
  }

  function layerIndex(layerName) {
    const i = character.def.layers.indexOf(layerName);
    return i === -1 ? character.def.layers.length : i;
  }

  /**
   * 描画対象リストを作成する。
   * 基本パーツ + 選択中アイテムを、レイヤー順 → カテゴリ順で並べる。
   * @param {Map<string, object>} selections カテゴリID → アイテム
   */
  function buildDrawList(selections) {
    const entries = [];

    for (const base of character.def.base) {
      entries.push({
        image: base.image,
        layer: layerIndex(base.layer),
        sub: -1
      });
    }

    for (const item of selections.values()) {
      entries.push({
        image: item.image,
        layer: layerIndex(item.layer),
        sub: categoryOrder.get(item.category) ?? 0
      });
    }

    entries.sort((a, b) => a.layer - b.layer || a.sub - b.sub);
    return entries;
  }

  /**
   * 現在の選択状態でキャラクターを描画する。
   */
  async function render(selections) {
    const drawList = buildDrawList(selections);
    const images = await Promise.all(
      drawList.map((e) => DataLoader.loadImage(character.basePath + e.image))
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const img of images) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  return { init, render };
})();
