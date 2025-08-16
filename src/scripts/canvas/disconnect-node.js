// CANVAS
// DISCONNECT NODE COMMAND

(function () {
  const btn = document.getElementById('disconnect-node-btn');
  if (btn) btn.addEventListener('click', () => mindMapCanvas.startConnection('disconnect'));
})();
