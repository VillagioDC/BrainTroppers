// CANVAS
// DETAIL NODE COMMAND

(function () {
  // Elements
  const detailBtn = document.getElementById('detail-node-btn');
  let detailPopup = document.getElementById('detail-node-popup');
  let contentChanged = false;
  let detailChanged = false;

  // Event listeners
  detailBtn.addEventListener('click', detailBtnClick);

  // Detail button clicked
  async function detailBtnClick() {
    if (detailPopup) return;
    // Load detail popup
    await loadDetailPopup();
    await loadDetailContent();
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
  async function loadDetailContent() {
    // Load content
    const content = await mindMapCanvas.getSelectedContent();
    const detail = await mindMapCanvas.getSelectedDetail();
    // Node title
    const contentEl = document.getElementById('detail-node-content');
    if (contentEl) contentEl.innerText = content;
    // Node detail
    const detailEl = document.getElementById('detail-node-detail');
    if (detailEl) detailEl.innerText = detail;
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
  function closeDetailPopup() {
    // Submit detail to canvas and database
    submitDetail();
    // Remove detail popup
    removeDetailPopup();
  }

  // Submit detail
  function submitDetail() {
    // Update content if changed
    if (contentChanged) {
      const contentEl = document.getElementById('detail-node-content');
      if (contentEl) {
        // Update database
        console.log('Update content: ', contentEl.innerText);
        // Update canvas
        mindMapCanvas.setSelectedContent(contentEl.innerText);
      }
    }
    // Update detail if changed
    if (detailChanged) {
      const detailEl = document.getElementById('detail-node-detail');
      if (detailEl) {
        // Update database
        console.log('Update detail: ', detailEl.innerText);
        // Update canvas
        mindMapCanvas.setSelectedDetail(detailEl.innerText);
      }
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