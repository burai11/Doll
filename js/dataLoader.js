/**
 * dataLoader.js
 * JSONと画像の読み込みを担当する。
 * 画像はキャッシュし、同じ画像を二度読み込まない。
 */
const DataLoader = (() => {
  const imageCache = new Map();

  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`JSON読み込み失敗: ${url} (${res.status})`);
    }
    return res.json();
  }

  function loadImage(url) {
    if (imageCache.has(url)) {
      return imageCache.get(url);
    }
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`画像読み込み失敗: ${url}`));
      img.src = url;
    });
    imageCache.set(url, promise);
    return promise;
  }

  /**
   * キャラクター一式（定義・衣装データ）を読み込む。
   * @returns {Promise<{def: object, items: object[], basePath: string}>}
   */
  async function loadCharacter(basePath) {
    const def = await loadJSON(basePath + "character.json");
    const items = await loadJSON(basePath + def.items);
    return { def, items, basePath };
  }

  return { loadJSON, loadImage, loadCharacter };
})();
