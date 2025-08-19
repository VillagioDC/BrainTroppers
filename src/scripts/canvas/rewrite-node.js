// CANVAS
// REWRITE NODE COMMAND

(function () {
  // Elements
  const rewriteBtn = document.getElementById('rewrite-node-btn');
  // Event listeners
  if (rewriteBtn) rewriteBtn.addEventListener('click', rewriteBtnClick);

  // Functions
  function rewriteBtnClick() {
    // Rewrite node on database
    console.log('Rewrite node on database');
    // Rewrite node on canvas
    mindMapCanvas.rewriteSelected()
  }

})();
