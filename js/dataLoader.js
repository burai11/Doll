const DataLoader = (() => {
  const imageCache = new Map();
  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load JSON: ${url} (${response.status})`);
    return response.json();
  }
  function loadImage(url) {
    if (!imageCache.has(url)) {
      imageCache.set(url, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load image: ${url}`));
        image.src = url;
      }));
    }
    return imageCache.get(url);
  }
  async function loadCharacter(basePath) {
    const def = await loadJSON(basePath + "character.json");
    const items = await loadJSON(basePath + def.items);
    return { def, items, basePath };
  }
  return { loadJSON, loadImage, loadCharacter };
})();
