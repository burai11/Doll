/**
 * studio.js
 * Studio Mode（撮影モード）を担当する。
 * UIを非表示にし、キャラクター表示のみをPNGとして保存する。
 * 保存はCanvasの内容のみを書き出すため、UIは一切含まれない。
 */
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

  function enter() {
    document.body.classList.add("studio-mode");
    controlsEl.hidden = false;
  }

  function exit() {
    document.body.classList.remove("studio-mode");
    controlsEl.hidden = true;
  }

  function timestamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
      "_" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds())
    );
  }

  function savePNG() {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studio_warabi_${timestamp()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return { init };
})();
