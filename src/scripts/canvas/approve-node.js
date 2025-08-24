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
    nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) return;
    // Get project Id
    projectId = braintroop.getProjectId();
    // Node content
    prevContent = braintroop.getSelectedContent();
    // Show notification
    await showNotification('Processing...', 'info', 'wait');
    // Set temp message
    braintroop.setSelectedContent('Approving node...');
    // Approve node
    const updatedMap = await aproveMapNode(nodeId);
    if (updatedMap) {
      // Set local storage map
      setLocalStorageMap(updatedMap);
      // Set data
      braintroop.setData();
    }
    // Restore node content
    braintroop.updateNode(nodeId, { content: prevContent });
    // Remove notification
    removeNotification();
    // Clean variables
    projectId = null;
    nodeId = null;
    prevContent = null;
  }

  // Approve node
  async function aproveMapNode(nodeId) {
    try {
      // Set parameters
      const { userId, sessionToken } = getLocalStorageCredentials();
      const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
      };
      const body = { userId, projectId, nodeId };
      //const url = `${process.env.API_URL}/mapApproveNode`;
      const url = `http://localhost:8888/.netlify/functions/mapApproveNode`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
      // Check response
        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Session expired.', 'error');
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 2000);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Get updated map with approved node
        const updatedMap = await response.json();
        return updatedMap;
    // Catch errors
    } catch (error) {
      console.error('Error adding node:', error);
      return false;
    }
  }

})();
