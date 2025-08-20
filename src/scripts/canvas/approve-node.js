// CANVAS
// APPROVE NODE COMMAND

(function () {
  // Elements
  const approveBtn = document.getElementById('approve-node-btn');
  let projectId = null;
  let nodeId = null;
  let prevContent = null;

  // Event listeners
  if (approveBtn) approveBtn.addEventListener('click', approveBtnClick);

  // Approve node
  async function approveBtnClick() {
    // Get node id
    nodeId = mindMapCanvas.getSelectedNodeId();
    if (!nodeId) return;
    // Get project Id
    projectId = mindMapCanvas.getProjectId();
    // Node content
    prevContent = mindMapCanvas.getSelectedContent();
    // Set temp message
    mindMapCanvas.setSelectedContent('Approving node...');
    // Approve node
    const result = await aproveMapNode(nodeId);
    if (result) {
      // Approve node on canvas
      mindMapCanvas.approveSelected();
    }
    // Restore node content
    mindMapCanvas.updateNode(nodeId, { content: prevContent });
    // Clean variables
    projectId = null;
    nodeId = null;
    prevContent = null;
  }

  // Approve node
  async function aproveMapNode(nodeId) {
    try {
      // Set parameters
      const token = "ABC123";
      const body = { projectId, nodeId };
      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      }
      //const url = `${process.env.API_URL}/mapApproveNode`;
      const url = `http://localhost:8888/.netlify/functions`+`/mapApproveNode`;
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
