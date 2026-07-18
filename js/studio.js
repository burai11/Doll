const Studio = (() => {
  let canvas = null;
  const controlsEl = document.getElementById("studio-controls");
  const btnOpen = document.getElementById("btn-studio");
  const btnExit = document.getElementById("btn-studio-exit");
  const btnSave = document.getElementById("btn-save");
  function init(canvasEl) {
    canvas = canvasEl;
    btnOpen.addEventListener("click", enter);
    btnExit.addEventListener("click", exit);
    btnSave.addEventListener("click", savePNG);
  }
  function enter() { document.body.classList.add("studio-mode"); controlsEl.hidden = false; }
  function exit() { document.body.classList.remove("studio-mode"); controlsEl.hidden = true; }
  function savePNG() {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "studio_warabi.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }
  return { init };
})();
