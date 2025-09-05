// CANVAS
// CONNECT NODE COMMAND

(function () {
  // Elements
  const connectBtn = document.getElementById('link-node-btn');

  // Event listeners
  if (connectBtn) connectBtn.addEventListener('click', connectBtnClick);

  // Connect nodes
  function connectBtnClick() {
    // Connect nodes on database
    console.log('Connect nodes on database');
    // Connect nodes on canvas
    braintroop.startConnection('strong');
  }

})();
