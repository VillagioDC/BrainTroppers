// CANVAS
// DELETE NODE COMMAND

(function () {
  // Elements
  const deleteBtn = document.getElementById('delete-node-btn');
  let projectId = null;  
  let nodeId = null;
  let prevContent = null;

  // Event listeners
  if (deleteBtn) deleteBtn.addEventListener('click', deleteBtnClick);

  // Functions
  async function deleteBtnClick() {
    // Get node id
    nodeId = mindMapCanvas.getSelectedNodeId();
    if (!nodeId) return;
    // Get project Id
    projectId = mindMapCanvas.getProjectId();
    // Node content
    prevContent = mindMapCanvas.getSelectedContent();
    // Set temp message
    mindMapCanvas.setSelectedContent('Deleting node...');
    // Delete node
    const result = await deleteMapNode(nodeId);
    // Restore previous node
    if (!result) {
      mindMapCanvas.updateNode(nodeId, { content: prevContent });
    }
    if (result) {
      // Delete node on canvas
      mindMapCanvas.deleteSelected()
    }
    // Clean variables
    projectId = null;
    nodeId = null;
    prevContent = null;
  }

  // Delete node
  async function deleteMapNode(nodeId) {
    try {
      // Set parameters
      const token = "ABC123";
      const body = { projectId, nodeId };
      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      }
      //const url = `${process.env.API_URL}/mapDeleteNode`;
      const url = `http://localhost:8888/.netlify/functions`+`/mapDeleteNode`;
      // Make request
      const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
      });
      // Check response
        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Session expired. Please log in again.', 'error');
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 2000);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    // Return
    return true;

    // Catch errors
    } catch (error) {
      console.error('Error adding node:', error);
      return false;
    }
  }

})();
