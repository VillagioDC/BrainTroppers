// CANVAS SCRIPT
// MODULAR LOADER

document.addEventListener('DOMContentLoaded', function() {
  // Helper: dynamic script loader
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.type = 'text/javascript';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  // Load UI + D3 (D3 is already included in HTML) + MindMap core + data + commands
  // Order matters: core -> data -> commands
  Promise.all([
    // Interface pieces (leave as-is if present in your project)
    loadScript('../scripts/canvas/sidebar.js').catch(()=>{}),
    loadScript('../scripts/canvas/map-menu.js').catch(()=>{}),
    loadScript('../scripts/canvas/user-menu.js').catch(()=>{}),
    loadScript('../scripts/canvas/theme.js').catch(()=>{}),
    loadScript('../scripts/canvas/zoom.js').catch(()=>{}),

    // Core mind map canvas + initial nodes
    loadScript('../scripts/canvas/mindmap-canvas.js'),
    loadScript('../scripts/canvas/nodes.js'),
  ])
  .then(() => {
    // Seed data
    if (window.NodeStore && window.mindMapCanvas) {
      const data = window.NodeStore.getInitialData();
      window.mindMapCanvas.setData(data);
    }
    // Load command scripts
    return Promise.all([
      loadScript('../scripts/canvas/add-node.js'),
      loadScript('../scripts/canvas/detail-node.js'),
      loadScript('../scripts/canvas/edit-node.js'),
      loadScript('../scripts/canvas/expand-node.js'),
      loadScript('../scripts/canvas/rewrite-node.js'),
      loadScript('../scripts/canvas/approve-node.js'),
      loadScript('../scripts/canvas/delete-node.js'),
      loadScript('../scripts/canvas/connect-node.js'),
      loadScript('../scripts/canvas/disconnect-node.js'),
      loadScript('../scripts/canvas/rewire-all.js'),
    ]);
  })
  .then(() => {
    console.log('Canvas bootstrapped with modular scripts.');
  })
  .catch(error => {
    console.error('Error loading canvas scripts:', error);
  });
});
