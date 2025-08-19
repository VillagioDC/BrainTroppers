// CANVAS
// DELETE NODE COMMAND

(function () {
  // Elements
  const deleteBtn = document.getElementById('delete-node-btn');
  // Event listeners
  if (deleteBtn) deleteBtn.addEventListener('click', deleteBtnClick);

  // Functions
  function deleteBtnClick() {
    // Delete node on database
    console.log('Delete node on database');
    // Delete node on canvas
    mindMapCanvas.deleteSelected()
  }

})();
