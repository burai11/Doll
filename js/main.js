(async () => {
  const loadingEl = document.getElementById("loading");
  const canvas = document.getElementById("character-canvas");
  const selectEl = document.getElementById("character-select");
  function showError(error) {
    console.error(error);
    loadingEl.classList.add("error");
    loadingEl.textContent = "Could not load the game. Open it through a local server.";
  }
  try {
    const list = await DataLoader.loadJSON("characters/characters.json");
    for (const entry of list.characters) {
      const option = document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.name;
      selectEl.appendChild(option);
    }
    async function selectCharacter(id) {
      const entry = list.characters.find((candidate) => candidate.id === id) ?? list.characters[0];
      selectEl.value = entry.id;
      const character = await DataLoader.loadCharacter(entry.path);
      Renderer.init(canvas, character);
      Wardrobe.init(character, (selections) => Renderer.render(selections));
      await Renderer.render(Wardrobe.getSelections());
    }
    selectEl.addEventListener("change", () => selectCharacter(selectEl.value).catch(showError));
    Studio.init(canvas);
    await selectCharacter(list.default);
    loadingEl.classList.add("hidden");
  } catch (error) {
    showError(error);
  }
})();
