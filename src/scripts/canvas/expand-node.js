// CANVAS
// EXPAND NODE COMMAND

(function () {
  const btn = document.getElementById('expand-node-btn');
  if (btn) btn.addEventListener('click', () => mindMapCanvas.expandSelected());
})();
