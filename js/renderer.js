const Renderer = (() => {
  let canvas = null;
  let ctx = null;
  let character = null;
  let categoryOrder = new Map();
  const cutoutCache = new Map();

  function init(canvasEl, characterData) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    character = characterData;
    canvas.width = character.def.canvas.width;
    canvas.height = character.def.canvas.height;
    categoryOrder = new Map(character.def.categories.map((category, index) => [category.id, index]));
  }

  function layerIndex(layerName) {
    const index = character.def.layers.indexOf(layerName);
    return index === -1 ? character.def.layers.length : index;
  }

  function buildDrawList(selections) {
    const hiddenLayers = new Set();
    for (const item of selections.values()) {
      if (Array.isArray(item.hideLayers)) {
        for (const layerName of item.hideLayers) hiddenLayers.add(layerName);
      }
    }
    const entries = character.def.base
      .filter((base) => !hiddenLayers.has(base.layer))
      .map((base) => ({
        image: base.image,
        layer: layerIndex(base.layer),
        sub: -1,
        removeWhiteBackground: base.removeWhiteBackground === true,
        offsetX: base.offsetX ?? 0,
        offsetY: base.offsetY ?? 0
      }));
    for (const item of selections.values()) {
      entries.push({
        image: item.image,
        layer: layerIndex(item.layer),
        sub: categoryOrder.get(item.category) ?? 0,
        removeWhiteBackground: item.removeWhiteBackground === true,
        offsetX: item.offsetX ?? 0,
        offsetY: item.offsetY ?? 0
      });
    }
    entries.sort((a, b) => a.layer - b.layer || a.sub - b.sub);
    return entries;
  }

  function isNearWhite(data, pixel) {
    const offset = pixel * 4;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return red > 235 && green > 235 && blue > 235 && Math.max(red, green, blue) - Math.min(red, green, blue) < 18;
  }

  function makeWhiteBackgroundTransparent(image) {
    const offscreen = document.createElement("canvas");
    offscreen.width = image.naturalWidth || image.width;
    offscreen.height = image.naturalHeight || image.height;
    const offscreenCtx = offscreen.getContext("2d", { willReadFrequently: true });
    offscreenCtx.drawImage(image, 0, 0);
    const imageData = offscreenCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const { data } = imageData;
    const pixelCount = offscreen.width * offscreen.height;
    const visited = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let head = 0;
    let tail = 0;

    function enqueue(pixel) {
      if (!visited[pixel] && isNearWhite(data, pixel)) {
        visited[pixel] = 1;
        queue[tail++] = pixel;
      }
    }

    for (let x = 0; x < offscreen.width; x += 1) {
      enqueue(x);
      enqueue((offscreen.height - 1) * offscreen.width + x);
    }
    for (let y = 1; y < offscreen.height - 1; y += 1) {
      enqueue(y * offscreen.width);
      enqueue(y * offscreen.width + offscreen.width - 1);
    }

    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % offscreen.width;
      const y = Math.floor(pixel / offscreen.width);
      if (x > 0) enqueue(pixel - 1);
      if (x + 1 < offscreen.width) enqueue(pixel + 1);
      if (y > 0) enqueue(pixel - offscreen.width);
      if (y + 1 < offscreen.height) enqueue(pixel + offscreen.width);
    }

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      if (visited[pixel]) data[pixel * 4 + 3] = 0;
    }
    offscreenCtx.putImageData(imageData, 0, 0);
    return offscreen;
  }

  function loadCutout(url) {
    if (!cutoutCache.has(url)) {
      cutoutCache.set(url, DataLoader.loadImage(url).then(makeWhiteBackgroundTransparent));
    }
    return cutoutCache.get(url);
  }

  async function render(selections) {
    const drawList = buildDrawList(selections);
    const images = await Promise.all(drawList.map((entry) => {
      const url = character.basePath + entry.image;
      return entry.removeWhiteBackground ? loadCutout(url) : DataLoader.loadImage(url);
    }));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images.forEach((image, index) => {
      const { offsetX, offsetY } = drawList[index];
      ctx.drawImage(image, offsetX, offsetY, canvas.width, canvas.height);
    });
  }

  return { init, render };
})();
