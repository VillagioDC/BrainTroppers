// CANVAS
// REWIRE ALL COMMAND

(function () {
  // Elements
  const rewireBtn = document.getElementById('rewire-all-btn');
  // Event listeners
  if (rewireBtn) rewireBtn.addEventListener('click', rewireBtnClick);

  // Rewire all nodes
  function rewireBtnClick() {
    // Rewire all nodes on database
    console.log('Rewire all nodes on database');
    // Rewire all nodes on canvas
    mindMapCanvas.rewireAll()
  }

})();
