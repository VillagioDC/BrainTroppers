// CANVAS
// ADD NODE COMMAND

(function () {
  // Elements
  const addBtn = document.getElementById('add-node-btn');
  let addPopup = document.getElementById('add-node-popup');
  let projectId = null;
  let parentNodeId = null;
  
  // Event listeners
  if (addBtn) addBtn.addEventListener('click', addBtnClick);

  // Add button clicked
  async function addBtnClick() {
    if (addPopup) return;
    // Load add popup
    await loadAddPopup();
  }

  // Load add popup
  async function loadAddPopup() {
    return await fetch('./src/snippets/add-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        addPopup = document.getElementById('add-node-popup');
        bindAddPopupEvents();
        parentNodeId = mindMapCanvas.getSelectedNodeId();
        projectId = mindMapCanvas.getProjectId();
      });
  }

  // Bind add popup events
  function bindAddPopupEvents() {
      // Elements
      const closeBtn = document.getElementById('close-add-node-popup');
      const submit = document.getElementById('add-node-submit');
      // Event listeners
      if (closeBtn) closeBtn.addEventListener('click', closeAddPopup);
      if (submit) submit.addEventListener('click', closeAddPopup);
      document.addEventListener('click', outsideClickHandler);
  }

  // Close add popup
  async function closeAddPopup() {
    // Check query
    const query = checkQuery();
    if (query) {
      // Show notification
      await showNotification('Processing...', 'info', 'wait');
      // Add node with temp id
      const nodeId = addTempNode();
      // Remove add popup
      removeAddPopup();
      // Submit query to add node
      const updatedMap = await mapNodeAdd(query);
      // Remove temp node
      if (!updatedMap)
        mindMapCanvas.deleteNode(nodeId);
      // Update node
      if (updatedMap) {
        // Set local storage map
        setLocalStorageMap(updatedMap);
        // Set data
        mindMapCanvas.setData();
      }
      // Remove notification
      removeNotification();
    } else {
      // Remove add popup
      removeAddPopup();
    }
    // Clean variables
    parentNodeId = null;
    projectId = null;
  }

  // Check query
  function checkQuery() {
    // Check content
    if (!document.getElementById('add-node-query')) return null;
    const query = document.getElementById('add-node-query');
    if (!query || !query.value || query.value.trim() === '') return null;
    // Return sanitized query
    return sanitizeInput(query.value);
  }

  // Sanitizing input
  function sanitizeInput(input) {
    // Sanitize input
    if (!input || input.trim() === '') return '';
    return input.replace(/[^\w\s@.-]/gi, '').trim();
  }

  // Add node with temp id
  function addTempNode() {
    // Add temp node    
    const id = `node-${Date.now()}`;
    const w = mindMapCanvas.canvas.offsetWidth;
    const h = mindMapCanvas.canvas.offsetHeight;
    const content = "Creating...";
    mindMapCanvas.addNode({ id, content, x: Math.random() * (w - 140) + 70, y: Math.random() * (h - 56) + 28 });
    // Add connection
    if (parentNodeId && mindMapCanvas.nodes.find(n => n.id === parentNodeId)) {
    mindMapCanvas.addConnection(parentNodeId, id, 'strong');
    }
    // Return new node id
    return id;
  }

  // API call to add new node
  async function mapNodeAdd(query) {
      try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { userId, projectId, parentNodeId, query };
        //const url = `${process.env.API_URL}/mapAddNode`;
        const url = `http://localhost:8888/.netlify/functions/mapAddNode`;
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
        // Get updated map with new node
        const updatedMap = await response.json();
        return updatedMap;
    // Catch errors
    } catch (error) {
        console.error('Error adding node:', error);
        return false;
    }
  }

  // Add node
  function addNode(nodeId, result) {
    // Update node 
    mindMapCanvas.updateNode(nodeId, { content: result.content, detail: result.detail, approved: false });
    // Update node id
    mindMapCanvas.updateNodeId(nodeId, result.id);
  }

  // Remove add popup
  function removeAddPopup() {
    // Remove event listeners
    if (document.getElementById("close-add-node-popup"))
      document.getElementById("close-add-node-popup").removeEventListener("click", closeAddPopup);
    if (document.getElementById("add-node-submit"))
      document.getElementById("add-node-submit").removeEventListener("click", closeAddPopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove add popup container
    addPopup.remove();
    addPopup = null;
  }

  // Outside click handler
  function outsideClickHandler(e) {
    if (e.target === addPopup) closeAddPopup();
  }

})();