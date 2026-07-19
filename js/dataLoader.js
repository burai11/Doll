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
  async function applySharedBackgrounds(def, items) {
    if (!def.sharedBackgrounds) return;
    if (!def.layers.includes("background")) def.layers.unshift("background");
    if (!def.categories.some((category) => category.id === "background")) {
      def.categories.unshift({ id: "background", name: "Background", allowNone: true });
    }
    const shared = await loadJSON("characters/shared_backgrounds.json");
    for (const bg of shared) {
      if (items.some((item) => item.id === bg.id)) continue;
      items.push({
        id: bg.id,
        name: bg.name,
        category: "background",
        layer: "background",
        image: "../shared_backgrounds/" + bg.image,
        tags: bg.tags ?? []
      });
    }
  }
  async function loadCharacter(basePath) {
    const def = await loadJSON(basePath + "character.json");
    const items = await loadJSON(basePath + def.items);
    await applySharedBackgrounds(def, items);
    return { def, items, basePath };
  }
  return { loadJSON, loadImage, loadCharacter };
})();
