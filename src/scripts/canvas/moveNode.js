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
    nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) return;
    // Get project Id
    projectId = braintroop.getProjectId();
    // Node content
    prevContent = braintroop.getSelectedContent();
    // Show notification
    await showNotification('Processing...', 'info', 'wait');
    // Set temp message
    braintroop.setSelectedContent('Deleting...');
    // Delete node
    const updatedMap = await deleteMapNode(nodeId);
    // Restore previous node
    if (!updatedMap) {
      braintroop.updateNode(nodeId, { content: prevContent });
    }
    if (updatedMap) {
      // Set local storage map
      setLocalStorageMap(updatedMap);
      // Set data
      braintroop.setData();
    }
    // Remove notification
    removeNotification();
    // Clean variables
    projectId = null;
    nodeId = null;
    prevContent = null;
  }

  // Delete node
  async function deleteMapNode(nodeId) {
    try {
      // Set parameters
      const { userId, sessionToken } = getLocalStorageCredentials();
      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
      }
      const body = { userId, projectId, nodeId };
      //const url = `${process.env.API_URL}/mapDeleteNode`;
      const url = `http://localhost:8888/.netlify/functions/mapDeleteNode`;
      // Make request
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
      // Get updated map with deleted node
      const updatedMap = await response.json();
      return updatedMap;

    // Catch errors
    } catch (error) {
      console.error('Error adding node:', error);
      return false;
    }
  }

})();
