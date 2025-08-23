// CANVAS
// REWIRE ALL COMMAND

(function () {
    // Elements
    const rewireBtn = document.getElementById('rewire-all-btn');
    let projectId = null;

    // Event listeners
    if (rewireBtn) rewireBtn.addEventListener('click', rewireBtnClick);

    // Rewire all nodes
    async function rewireBtnClick() {
        // Get project Id
        projectId = mindMapCanvas.getProjectId();
        if (!projectId) return;
        // Show notification
        await showNotification('Processing...', 'info', 'wait');
        // Request rewire all nodes on database
        const updatedMap = await mapRewireAll(projectId);
        if (updatedMap) {
          // Set local storage map
          setLocalStorageMap(updatedMap);
          // Set data
          mindMapCanvas.setData();
        }
        // Remove notification
        removeNotification();
        // Clean variables
        projectId = null;
    }

    // Rewire all nodes
    async function mapRewireAll(projectId) {
      try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { userId, projectId };
        //const url = `${process.env.API_URL}/mapRewire`;
        const url = `http://localhost:8888/.netlify/functions/mapRewire`;
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
        // Get updated map rewired
        const updatedMap = await response.json();
        return updatedMap;
    // Catch errors
    } catch (error) {
        console.error('Error expanding node:', error);
        return false;
    }
  }

})();
