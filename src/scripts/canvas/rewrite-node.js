// CANVAS
// REWRITE NODE COMMAND

(function () {
  // Elements
  const rewriteBtn = document.getElementById('rewrite-node-btn');
  let rewritePopup = document.getElementById('rewrite-node-popup');
  let projectId;
  let nodeId;
  let prevContent;

  // Event listeners
  if (rewriteBtn) rewriteBtn.addEventListener('click', rewriteBtnClick);

  // Rewrite node
  async function rewriteBtnClick() {
    // Load rewrite popup
    if (rewritePopup) return;
    // Load rewrite popup
    await loadRewritePopup();
    loadDetailContent();
  }

  // Load rewrite popup
  async function loadRewritePopup() {
    return await fetch('./src/snippets/rewrite-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        rewritePopup = document.getElementById('rewrite-node-popup');
        bindRewritePopupEvents();
        nodeId = mindMapCanvas.getSelectedNodeId();
        projectId = mindMapCanvas.getProjectId();
      });
  }

  // Bind expand popup events
  function bindRewritePopupEvents() {
    // Elements
    const closeBtn = document.getElementById('close-rewrite-node-popup');
    const submit = document.getElementById('rewrite-node-submit');
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeRewritePopup);
    if (submit) submit.addEventListener('click', closeRewritePopup);
    document.addEventListener('click', outsideClickHandler);
  }

  // Load detail content
  function loadDetailContent() {
    // Load content
    const content = mindMapCanvas.getSelectedContent();
    const detail = mindMapCanvas.getSelectedDetail();
    // Popup node content
    const contentEl = document.getElementById('rewrite-node-content');
    if (contentEl) contentEl.innerText = content;
    // Popup node detail
    const detailEl = document.getElementById('rewrite-node-detail');
    if (detailEl) detailEl.innerText = detail;
  }

  // Close rewrite popup
  async function closeRewritePopup() {
    // Check query
    const query = checkQuery();
    if (query) {
      // Check content
      if (document.getElementById('rewrite-node-content'))
        prevContent = document.getElementById('rewrite-node-content').innerText;
      // Set temp message
      mindMapCanvas.setSelectedContent('Rewriting node...');
      // Remove rewrite popup
      removeRewritePopup();
      // Show notification
      await showNotification('Processing...', 'info', 'wait');
      // Submit query to expand node
      const updatedMap = await mapNodeRewrite(query);
      // Reset temp node
      if (!updatedMap) {
        mindMapCanvas.setSelectedContent(prevContent);
      }
      if (updatedMap) {
        // Set local storage map
        setLocalStorageMap(updatedMap);
        // Set data
        mindMapCanvas.setData();
      }
      // Remove notification
      removeNotification();
    } else {
      // Remove rewrite popup
      removeRewritePopup();
    }
    // Clean variables
    projectId = null;
    parentNodeId = null;
    prevContent = null;
  }

  // Check query
  function checkQuery() {
    // Check content
    if (!document.getElementById('rewrite-node-query')) return null;
    const query = document.getElementById('rewrite-node-query');
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

  // API call to rewrite node
  async function mapNodeRewrite(query) {
      try {
        // Set parameters
        const { userId, sessionToken } = getLocalStorageCredentials();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        };
        const body = { userId, projectId, nodeId, query };
        //const url = `${process.env.API_URL}/mapRewriteNode`;
        const url = `http://localhost:8888/.netlify/functions/mapRewriteNode`;
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
        // Get updated map with node recreated
        const updatedMap = await response.json();
        return updatedMap;
    // Catch errors
    } catch (error) {
        console.error('Error rewriting node:', error);
        return false;
    }
  }

  // Remove rewrite popup
  function removeRewritePopup() { 
    // Remove event listeners
    if (document.getElementById("close-rewrite-node-popup"))
      document.getElementById("close-rewrite-node-popup").removeEventListener("click", closeRewritePopup);
    if (document.getElementById("rewrite-node-submit"))
      document.getElementById("rewrite-node-submit").removeEventListener("click", closeRewritePopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove rewrite popup container
    rewritePopup.remove();
    rewritePopup = null;
  }

  // Outside click handler
  function outsideClickHandler(e) {
    if (e.target === rewritePopup) closeRewritePopup();
  }

})();

