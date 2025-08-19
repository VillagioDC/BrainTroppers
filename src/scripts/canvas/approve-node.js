// CANVAS
// APPROVE NODE COMMAND

(function () {
  // Elements
  const approveBtn = document.getElementById('approve-node-btn');
  // Event listeners
  if (approveBtn) approveBtn.addEventListener('click', approveBtnClick);

  // Approve node
  function approveBtnClick() {
    // Approve node on database
    console.log('Approve node on database');
    // Approve node on canvas
    mindMapCanvas.approveSelected();
  }

})();
