// CANVAS
// EXPAND NODE COMMAND

(function () {
  // Elements
  const expandBtn = document.getElementById('expand-node-btn');
  let expandPopup = document.getElementById('expand-node-popup');
  let projectId = null;
  let parentNodeId = null;

  // Event listeners
  if (expandBtn) expandBtn.addEventListener('click', expandBtnClick);

  // Expand node
  async function expandBtnClick() {
    // Load expand popup
    if (expandPopup) return;
    // Load expand popup
    await loadExpandPopup();
    loadDetailContent();
  }

  // Load expand popup
  async function loadExpandPopup() {
    return await fetch('./src/snippets/expand-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        expandPopup = document.getElementById('expand-node-popup');
        bindExpandPopupEvents();
        parentNodeId = mindMapCanvas.getSelectedNodeId();
        projectId = mindMapCanvas.getProjectId();
      });
  }

  // Bind expand popup events
  function bindExpandPopupEvents() {
    // Elements
    const closeBtn = document.getElementById('close-expand-node-popup');
    const submit = document.getElementById('expand-node-submit');
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeExpandPopup);
    if (submit) submit.addEventListener('click', closeExpandPopup);
    document.addEventListener('click', outsideClickHandler);
  }

  // Load detail content
  function loadDetailContent() {
    // Load content
    const content = mindMapCanvas.getSelectedContent();
    const detail = mindMapCanvas.getSelectedDetail();
    // Popup node content
    const contentEl = document.getElementById('expand-node-content');
    if (contentEl) contentEl.innerText = content;
    // Popup node detail
    const detailEl = document.getElementById('expand-node-detail');
    if (detailEl) detailEl.innerText = detail;
  }

  // Close expand popup
  async function closeExpandPopup() {
    // Check query
    const query = checkQuery();
    if (query) {
      // Add node with temp ip
      const tempNodeId = addTempNode();
      // Remove expand popup
      removeExpandPopup();
      // Submit query to expand node
      const result = await mapNodeExpand(query);
      // Remove temp node
      mindMapCanvas.deleteNode(tempNodeId);
      // Create new nodes
      if (result) {
        createExpandedNodes(result);
      }
    } else {
      // Remove expand popup
      removeExpandPopup();
    }
    // Clean variables
    projectId = null;
    parentNodeId = null;
  }

  // Check query
  function checkQuery() {
    // Check content
    if (!document.getElementById('expand-node-query')) return null;
    const query = document.getElementById('expand-node-query');
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
    const content = "Expanding...";
    mindMapCanvas.addNode({ id, content, x: Math.random() * (w - 140) + 70, y: Math.random() * (h - 56) + 28 });
    // Add connection
    if (id && mindMapCanvas.nodes.find(n => n.id === id)) {
    mindMapCanvas.addConnection(parentNodeId, id, 'strong');
    }
    // Return new node id
    return id;
  }

  // Expand node
  async function mapNodeExpand(query) {
      try {
        // Set parameters
      const { userId, token } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        const body = { userId, projectId, parentNodeId, query };
        //const url = `${process.env.API_URL}/mapExpandNode`;
        const url = `http://localhost:8888/.netlify/functions/mapExpandNode`;
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
        // Get expanded nodes
        const expandedNodes = await response.json();
        return expandedNodes;
    // Catch errors
    } catch (error) {
        console.error('Error expanding node:', error);
        return false;
    }
  }

  // Create expanded nodes
  function createExpandedNodes(result) {
    // Confirm result
    if (!result || result.length == 0) return;
    // Get canvas width and height
    const w = mindMapCanvas.canvas.offsetWidth;
    const h = mindMapCanvas.canvas.offsetHeight;
    // Add node array
    result.forEach(node => {
      // Add node
      let id = node.nodeId;
      let content = node.content;
      let detail = node.detail;
      let x = Math.random() * (w - 140) + 70;
      let y = Math.random() * (h - 56) + 28;
      mindMapCanvas.addNode({ id, content, detail, x, y});
      // Add connection
      if (id && mindMapCanvas.nodes.find(n => n.id === id)) {
        mindMapCanvas.addConnection(parentNodeId, id, 'strong');
      }
    })
  };

  // Remove expand popup
  function removeExpandPopup() {
    // Remove event listeners
    if (document.getElementById("close-expand-node-popup"))
      document.getElementById("close-expand-node-popup").removeEventListener("click", closeExpandPopup);
    if (document.getElementById("add-expand-submit"))
      document.getElementById("add-expand-submit").removeEventListener("click", closeExpandPopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove expand popup container
    expandPopup.remove();
    expandPopup = null;
  }

  // Outside click handler
  function outsideClickHandler(e) {
    // Close expand popup
    if (e.target === expandPopup) closeExpandPopup();
  }

})();
