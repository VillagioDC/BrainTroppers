// CANVAS
// ADD NODE COMMAND

(function () {
  // Elements
  const addBtn = document.getElementById('add-node-btn');
  let addPopup = document.getElementById('add-node-popup');
  let projectId = null;
  let parentNodeId = null;
  
  // Event listeners
  addBtn.addEventListener('click', addBtnClick);

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

  function bindAddPopupEvents() {
      // Elements
      const closeBtn = document.getElementById('close-add-node-popup');
      const query = document.getElementById('add-node-query');
      const submit = document.getElementById('add-node-submit');
      // Event listeners
      if (closeBtn) closeBtn.addEventListener('click', closeAddPopup);
      if (query) query.addEventListener('input', () => query.value = query.value.trim());
      if (submit) submit.addEventListener('click', closeAddPopup);
      document.addEventListener('click', outsideClickHandler);
  }

  // Close add popup
  async function closeAddPopup() {
    // Check query
    const query = checkQuery();
    if (query) {
      // Add node with temp id
      const nodeId = addTempNode();
      // Remove add popup
      removeAddPopup();
      // Submit query to add node
      const result = await mapNodeAdd(query);
      // Remove temp node
      if (!result)
        mindMapCanvas.deleteNode(nodeId);
      // Update node
      if (result) {
        // Add node
        addNode(nodeId, result);
      }
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
    const content = "Processing...";
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
        const token = "ABC123";
        const body = { projectId, parentNodeId, query };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        //const url = `${process.env.API_URL}/mapAddNode`;
        const url = `http://localhost:8888/.netlify/functions`+`/mapAddNode`;
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
        // Get updated node
        const updatedNode = await response.json();
        return updatedNode;
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
    if (document.getElementById("add-node-query"))
      document.getElementById("add-node-query").removeEventListener("input", () => query.value = query.value.trim());
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