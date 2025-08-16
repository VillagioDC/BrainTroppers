// CANVAS
// DELETE NODE COMMAND

(function () {
  const btn = document.getElementById('delete-node-btn');
  if (btn) btn.addEventListener('click', () => mindMapCanvas.deleteSelected());
})();
