// CANVAS
// REWRITE NODE COMMAND

(function () {
  const btn = document.getElementById('rewrite-node-btn');
  if (btn) btn.addEventListener('click', () => mindMapCanvas.rewriteSelected());
})();
