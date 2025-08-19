// CANVAS
// EXPAND NODE COMMAND

(function () {
  // Elements
  const expandBtn = document.getElementById('expand-node-btn');
  // Event listeners
  if (expandBtn) expandBtn.addEventListener('click', expandBtnClick);

  // Expand node
  function expandBtnClick() {
    // Get parent node
    const parentNode = window.mindMapCanvas.selectedNode;
    // Expand node on database
    console.log('Expand node on database');
    // Expand node
    mindMapCanvas.expandSelected();
  }

})();
