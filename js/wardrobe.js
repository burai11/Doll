/**
 * wardrobe.js
 * 着せ替えUIを担当する。
 * カテゴリタブと衣装一覧をJSONデータから自動生成する。
 */
const Wardrobe = (() => {
  let character = null;
  let selections = new Map(); // カテゴリID → 選択中アイテム
  let activeCategory = null;
  let onChange = null;

  const tabsEl = document.getElementById("category-tabs");
  const listEl = document.getElementById("item-list");

  function init(characterData, changeCallback) {
    character = characterData;
    onChange = changeCallback;
    selections = new Map();

    applyDefaultOutfit();
    buildTabs();
    selectCategory(character.def.categories[0]?.id ?? null);
  }

  function applyDefaultOutfit() {
    const outfit = character.def.defaultOutfit ?? {};
    for (const [categoryId, itemId] of Object.entries(outfit)) {
      const item = character.items.find((i) => i.id === itemId);
      if (item) selections.set(categoryId, item);
    }
  }

  function buildTabs() {
    tabsEl.innerHTML = "";
    for (const cat of character.def.categories) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-tab";
      btn.textContent = cat.name;
      btn.dataset.category = cat.id;
      btn.addEventListener("click", () => selectCategory(cat.id));
      tabsEl.appendChild(btn);
    }
  }

  function selectCategory(categoryId) {
    activeCategory = categoryId;
    for (const btn of tabsEl.children) {
      btn.classList.toggle("active", btn.dataset.category === categoryId);
    }
    buildItemList();
  }

  function buildItemList() {
    listEl.innerHTML = "";
    if (!activeCategory) return;

    const cat = character.def.categories.find((c) => c.id === activeCategory);
    const items = character.items.filter((i) => i.category === activeCategory);

    if (cat?.allowNone) {
      listEl.appendChild(createNoneCard());
    }
    for (const item of items) {
      listEl.appendChild(createItemCard(item));
    }
    updateSelectedState();
  }

  function createNoneCard() {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card";
    card.dataset.itemId = "";

    const thumb = document.createElement("div");
    thumb.className = "item-thumb none";
    thumb.textContent = "×";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = "なし";

    card.append(thumb, name);
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
    thumb.loading = "lazy";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = item.name;

    card.append(thumb, name);
    card.addEventListener("click", () => selectItem(item));
    return card;
  }

  function selectItem(item) {
    if (item === null) {
      selections.delete(activeCategory);
    } else {
      selections.set(activeCategory, item);
    }
    updateSelectedState();
    onChange?.(selections);
  }

  function updateSelectedState() {
    const selectedId = selections.get(activeCategory)?.id ?? "";
    for (const card of listEl.children) {
      card.classList.toggle("selected", card.dataset.itemId === selectedId);
    }
  }

  function getSelections() {
    return selections;
  }

  return { init, getSelections };
})();
