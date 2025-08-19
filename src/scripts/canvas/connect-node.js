// CANVAS
// CONNECT NODE COMMAND

(function () {
  // Elements
  const connectBtn = document.getElementById('connect-node-btn');
  // Event listeners
  if (connectBtn) connectBtn.addEventListener('click', connectBtnClick);

  // Connect nodes
  function connectBtnClick() {
    // Connect nodes on database
    console.log('Connect nodes on database');
    // Connect nodes on canvas
    mindMapCanvas.startConnection('strong');
  }

})();
