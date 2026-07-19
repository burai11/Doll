const Drawer = (() => {
  const body = document.body;
  const toggle = document.getElementById("drawer-toggle");
  const closeBtn = document.getElementById("drawer-close");
  const scrim = document.getElementById("scrim");

  function open() {
    body.classList.add("drawer-open");
    toggle.setAttribute("aria-expanded", "true");
  }
  function close() {
    body.classList.remove("drawer-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  function isOpen() { return body.classList.contains("drawer-open"); }

  toggle.addEventListener("click", () => (isOpen() ? close() : open()));
  closeBtn.addEventListener("click", close);
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  return { open, close };
})();
