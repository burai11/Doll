const Wardrobe = (() => {
  let character = null;
  let selections = new Map();
  let activeCategory = null;
  let onChange = null;
  const tabsEl = document.getElementById("category-tabs");
  const listEl = document.getElementById("item-list");

  function init(characterData, changeCallback) {
    character = characterData;
    onChange = changeCallback;
    selections = new Map();
    for (const [categoryId, itemId] of Object.entries(character.def.defaultOutfit ?? {})) {
      const item = character.items.find((candidate) => candidate.id === itemId);
      if (item) selections.set(categoryId, item);
    }
    tabsEl.innerHTML = "";
    for (const category of character.def.categories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-tab";
      button.textContent = category.name;
      button.dataset.category = category.id;
      button.addEventListener("click", () => selectCategory(category.id));
      tabsEl.appendChild(button);
    }
    selectCategory(character.def.categories[0]?.id ?? null);
  }

  function selectCategory(categoryId) {
    activeCategory = categoryId;
    for (const button of tabsEl.children) button.classList.toggle("active", button.dataset.category === categoryId);
    listEl.innerHTML = "";
    if (!activeCategory) return;
    const category = character.def.categories.find((candidate) => candidate.id === activeCategory);
    if (category?.allowNone) listEl.appendChild(createNoneCard());
    for (const item of character.items.filter((candidate) => candidate.category === activeCategory)) {
      listEl.appendChild(createItemCard(item));
    }
    updateSelectedState();
  }

  function createNoneCard() {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card";
    card.dataset.itemId = "";
    card.innerHTML = '<div class="item-thumb none">X</div><div class="item-name">None</div>';
    card.addEventListener("click", () => selectItem(null));
    return card;
  }

  function createItemCard(item) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card";
    card.dataset.itemId = item.id;
    const thumb = document.createElement("img");
    thumb.className = "item-thumb";
    thumb.src = character.basePath + item.image;
    thumb.alt = item.name;
    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = item.name;
    card.append(thumb, name);
    card.addEventListener("click", () => selectItem(item));
    return card;
  }

  function selectItem(item) {
    if (item) selections.set(activeCategory, item);
    else selections.delete(activeCategory);
    updateSelectedState();
    onChange?.(selections);
  }

  function updateSelectedState() {
    const selectedId = selections.get(activeCategory)?.id ?? "";
    for (const card of listEl.children) card.classList.toggle("selected", card.dataset.itemId === selectedId);
  }

  function getSelections() { return selections; }
  return { init, getSelections };
})();
