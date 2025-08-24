// CANVAS
// DETAIL NODE COMMAND

(function () {
  // Elements
  const detailBtn = document.getElementById('detail-node-btn');
  let detailPopup = document.getElementById('detail-node-popup');
  let projectId = null;
  let nodeId = null;
  let prevContent = null;
  let prevDetail = null;
  let contentChanged = false;
  let detailChanged = false;

  // Event listeners
  if (detailBtn) detailBtn.addEventListener('click', detailBtnClick);

  // Detail button clicked
  async function detailBtnClick() {
    if (detailPopup) return;
    // Load detail popup
    await loadDetailPopup();
    loadDetailContent();
    // Reset changed flags
    contentChanged = false;
    detailChanged = false;
  }

  // Load detail popup
  async function loadDetailPopup() {
    return await fetch('./src/snippets/detail-node-popup.html')
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        detailPopup = document.getElementById('detail-node-popup');
        bindDetailPopupEvents();
        projectId = braintroop.getProjectId();
      });
  }

  // Bind detail popup events
  function bindDetailPopupEvents() {
    // Elements
    const closeBtn = document.getElementById('close-detail-node-popup');
    const contentEl = document.getElementById('detail-node-content');
    const detailEl = document.getElementById('detail-node-detail');
    const submitBtn = document.getElementById('detail-node-submit');
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeDetailPopup);
    if (contentEl) contentEl.addEventListener('click', () => editElement('content'));
    if (detailEl) detailEl.addEventListener('click', () => editElement('detail'));
    if (submitBtn) submitBtn.addEventListener('click', closeDetailPopup);
    document.addEventListener('click', outsideClickHandler);
  }

  // Load detail content
  function loadDetailContent() {
    // Load content
    const content = braintroop.getSelectedContent();
    const detail = braintroop.getSelectedDetail();
    // Popup node content
    const contentEl = document.getElementById('detail-node-content');
    if (contentEl) contentEl.innerText = content;
    // Popup node detail
    const detailEl = document.getElementById('detail-node-detail');
    if (detailEl) detailEl.innerText = detail;
    // Previous node content and detail
    prevContent = content;
    prevDetail = detail;
  }

  // Edit element (h2 or p turns into textarea)
  function editElement(type) {
    // Get element
    const elId = `detail-node-${type}`;
    const el = document.getElementById(elId);
    if (!el) return;
    // Create textarea
    const textarea = document.createElement('textarea');
    // Style textarea
    const original = el.innerText;
    textarea.value = original;
    textarea.rows = (type === 'content') ? 2 : 10;
    el.parentNode.replaceChild(textarea, el);
    textarea.focus();
    // Create event listeners
    textarea.addEventListener('blur', finishEditing);
    // Finish editing
    function finishEditing() {
        const newVal = textarea.value.trim();
        el.innerText = newVal;
        textarea.parentNode.replaceChild(el, textarea);
        if (newVal !== original) {
          if (type === 'content') contentChanged = true;
          if (type === 'detail') detailChanged = true;
        }
    };
  }

  // Close detail popup
  async function closeDetailPopup() {
    // Check changes
    if (contentChanged || detailChanged) {
      // Get node id
      nodeId = braintroop.getSelectedNodeId();
      // Get content and details
      const contentEl = document.getElementById('detail-node-content');
      const detailEl = document.getElementById('detail-node-detail');
      // Sanitize inputs
      let content = '';
      if (contentEl && contentEl.value) content = contentEl.value;
      if (contentEl && contentEl.innerText) content = contentEl.innerText;
      content = sanitizeInput(content);
      let detail = '';
      if (detailEl && detailEl.value) detail = detailEl.value;
      if (detailEl && detailEl.innerText) detail = detailEl.innerText;
      detail = sanitizeInput(detail);
      // Remove detail popup
      removeDetailPopup();
      // Show notification
      await showNotification('Processing...', 'info', 'wait');
      // Update node
      if (content && content.trim() !== '') {
        // Set temp message
        braintroop.setSelectedContent('Saving...');
        // Update map
        const updatedMap = await mapNodeUpdate(nodeId, content, detail);
        // Restore previous node
        if (!updatedMap) {
          braintroop.updateNode(nodeId, { content: prevContent, detail: prevDetail });
        }
        // Updated map
        if (updatedMap) {
          // Set local storage map
          setLocalStorageMap(updatedMap);
          // Set data
          braintroop.setData();
        }
      // Delete empty node
      } else {
        // Set temp message
        braintroop.setSelectedContent('Deleting...');
        // Delete map
        const updatedMap = await deleteMapNode(nodeId);
        // Restore previous node
        if (!updatedMap) {
          braintroop.updateNode(nodeId, { content: prevContent, detail: prevDetail });
        }
        // Updated map
        if (updatedMap) {
          // Set local storage map
          setLocalStorageMap(updatedMap);
          // Set data
          braintroop.setData();
        }
      }
    } else {
      // Remove detail popup
      removeDetailPopup();
    }
    // Remove notification
    removeNotification();
    // Clean variables
    projectId = null;
    prevContent = null;
    prevDetail = null;
    contentChanged = false;
    detailChanged = false;
  }

  // Sanitizing input
  function sanitizeInput(input) {
    // Sanitize input
    if (!input || input.trim() === '') return '';
    return input.replace(/[^\w\s@.-]/gi, '').trim();
  }

  // Update map node 
  async function mapNodeUpdate(nodeId, content, detail) {
    try {
      // Set parameters
      const { userId, sessionToken } = getLocalStorageCredentials();
      const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
      };
      const body = { userId, projectId, nodeId, content, detail };
      //const url = `${process.env.API_URL}/mapUpdateNode`;
        const url = `http://localhost:8888/.netlify/functions`+`/mapUpdateNode`;
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
      // Get updated map with updated node
      const updatedMap = await response.json();
      return updatedMap;

    // Catch error
    } catch (error) {
        console.error('Error updating node:', error);
        return false;
    }
  }

  // Delete map node 
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

  // Remove detail popup
  function removeDetailPopup() {
    // Remove event listeners
    if (document.getElementById("close-detail-node-popup"))
      document.getElementById("close-detail-node-popup").removeEventListener("click", closeDetailPopup);
    if (document.getElementById("detail-node-content"))
      document.getElementById("detail-node-content").removeEventListener("click", () => editElement('content'));
    if (document.getElementById("detail-node-detail"))
      document.getElementById("detail-node-detail").removeEventListener("click", () => editElement('detail'));
    if (document.getElementById("detail-node-submit"))
      document.getElementById("detail-node-submit").removeEventListener("click", closeDetailPopup);
    document.removeEventListener('click', outsideClickHandler);
    // Remove detail popup container
    detailPopup.remove();
    detailPopup = null;
  }

  // Outside click handler
  function outsideClickHandler(event) {
    if (event.target === detailPopup) {
      closeDetailPopup();
    } 
  }

})();