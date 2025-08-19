// CANVAS
// DISCONNECT NODE COMMAND

(function () {
  // Elements
  const disconnectBtn = document.getElementById('disconnect-node-btn');
  // Event listeners
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectBtnClick)

  function disconnectBtnClick() {
    // Disconnect nodes on database
    console.log('Disconnect nodes on database');
    // Disconnect nodes on canvas
    mindMapCanvas.disconnectSelected();
  }

})();
