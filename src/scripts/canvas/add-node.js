// CANVAS
// ADD NODE COMMAND

(function () {
  // Elements
  const addBtn = document.getElementById('add-node-btn');
  let addPopup = document.getElementById('add-node-popup');
  let parentNode = null;
  
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
        getParentNode();
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

  // Get parent node
  function getParentNode() {
    parentNode = window.mindMapCanvas.selectedNode;
  }

  // Close add popup
  function closeAddPopup() {
    // Submit query to add node
    submitAdd();
    // Remove add popup
    removeAddPopup();
  }

  // Submit query to add node
  function submitAdd() {
    // Check content
    const query = document.getElementById('add-node-query');
    // Add node and connection to database
    console.log('Add to database: ', query.value);
    // Add node and connection to canvas
    if (query && query.value) {
        // Add node
        const id = `node-${Date.now()}`;
        const w = mindMapCanvas.canvas.offsetWidth;
        const h = mindMapCanvas.canvas.offsetHeight;
        const content = query.value;
        mindMapCanvas.addNode({ id, content, x: Math.random() * (w - 140) + 70, y: Math.random() * (h - 56) + 28 });
        // Add connection
        if (parentNode && parentNode.id && mindMapCanvas.nodes.find(n => n.id === parentNode.id)) {
        mindMapCanvas.addConnection(parentNode.id, id, 'strong');
        }
      }
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